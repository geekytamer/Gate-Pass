from fastapi import APIRouter, Request, Depends, BackgroundTasks, Query
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from datetime import datetime, timedelta
from app.db.session import get_db
from app.models.user import User, ParentStudentLink
from app.models.exit_request import ExitRequest
from app.models.conversation_state import ConversationState
from app.models.bus import Bus
from app.models.otp import OTP
from app.models.processed_webhook import ProcessedWebhook
from app.services.message_classifier import is_exit_request
from app.services.qr import generate_qr_image
from app.services.whatsapp import send_whatsapp_message, send_approve_request
from app.services.sms_service import send_sms
from app.core.security import generate_random_otp
from app.core.config import settings
from app.models.conversation_state import ConversationStateEnum
from app.models.conversation_state import ConversationStateEnum
from sqlalchemy import and_

from app.utils.language import detect_language, translate


router = APIRouter()

def set_conversation_state(db: Session, state: ConversationState, new_state: ConversationStateEnum):
    state.state = new_state
    state.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(state)

def match_student_bus_reply(reply_text: str, bus_list: list) -> Bus | None:
    cleaned_reply = reply_text.strip().lower()

    if cleaned_reply.isdigit():
        index = int(cleaned_reply) - 1
        if 0 <= index < len(bus_list):
            return bus_list[index]

    for bus in bus_list:
        if cleaned_reply == bus.name.lower():
            return bus

    return None

@router.get("/webhook")
def verify_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token")
):
    VERIFY_TOKEN = "123456"
    if hub_mode == "subscribe" and hub_verify_token == VERIFY_TOKEN:
        return int(hub_challenge)
    return {"message": "Invalid verification token"}

@router.post("/webhook")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    data = await request.json()
    try:
        msg = data['entry'][0]['changes'][0]['value']['messages'][0]
        message_id = msg['id']
        if db.query(ProcessedWebhook).filter_by(id=message_id).first():
            return {"status": "Duplicate webhook"}
        db.add(ProcessedWebhook(id=message_id))
        db.commit()
        background_tasks.add_task(process_webhook, msg, db)
        return {"status": "received"}
    except (KeyError, IndexError):
        return {"status": "invalid"}

async def process_webhook(msg: dict, db: Session):
    phone = msg["from"]
    text = msg["text"]["body"].strip()
    user = db.query(User).filter_by(phone_number=phone).first()
    if not user:
        return

    if user.role == "student":
        state = db.query(ConversationState).filter_by(student_id=user.id).first()
        if not state:
            lang = detect_language(text)
            state = ConversationState(student_id=user.id, state=ConversationStateEnum.idle, language=lang)
            db.add(state)
            db.commit()
            
        if state.state == ConversationStateEnum.idle:
            lang = detect_language(text)
            if lang != state.language:
                state.language = lang
                db.commit()
        else:
            lang = state.language

        if text.lower() == "cancel":
            state.state = ConversationStateEnum.idle
            db.commit()
            send_whatsapp_message(phone, translate("cancel_success", lang))
            return

        match state.state:
            case ConversationStateEnum.idle:
                if is_exit_request(text):
                    state.state = ConversationStateEnum.awaiting_exit_method
                    db.commit()
                    send_whatsapp_message(phone, translate("choose_exit_method", lang))
                else:
                    send_whatsapp_message(phone, translate("start_request", lang))

            case ConversationStateEnum.awaiting_exit_method:
                method_map = {"1": "relative", "2": "bus", "3": "self"}
                exit_method = method_map.get(text)
                if not exit_method:
                    send_whatsapp_message(phone, translate("invalid_exit_method", lang))
                    return

                if exit_method == "bus":
                    buses = db.query(Bus).filter_by(university_id=user.university_id).all()
                    valid_buses = [
                        bus for bus in buses if db.query(ExitRequest)
                        .filter_by(bus_id=bus.id, status="approved")
                        .count() < bus.capacity
                    ]
                    if not valid_buses:
                        send_whatsapp_message(phone, translate("no_buses", lang))
                        return
                    state.state = ConversationStateEnum.awaiting_bus
                    db.commit()
                    bus_list = "\n".join([f"{i+1}. {b.name} - {b.destination_district}" for i, b in enumerate(valid_buses)])
                    send_whatsapp_message(phone, translate("select_bus", lang) + "\n" + bus_list)
                    state.temp_data = ",".join([str(b.id) for b in valid_buses])
                    db.commit()
                elif exit_method == "relative":
                    state.state = ConversationStateEnum.awaiting_relative_name
                    db.commit()
                    send_whatsapp_message(phone, translate("ask_relative_name", lang))
                else:
                    await create_exit_request(db, user, phone, "self")
                    state.state = ConversationStateEnum.idle
                    db.commit()
                    send_whatsapp_message(phone, translate("request_sent", lang))

            case ConversationStateEnum.awaiting_relative_name:
                relative_name = text.strip()
                await create_exit_request(db, user, phone, "relative", relative_name=relative_name)
                state.state = ConversationStateEnum.idle
                db.commit()
                send_whatsapp_message(phone, translate("request_sent_relative", lang, name=relative_name))

            case ConversationStateEnum.awaiting_bus:
                selected_index = int(text) - 1 if text.isdigit() else None
                bus_ids = state.temp_data.split(",") if state.temp_data else []
                if selected_index is not None and 0 <= selected_index < len(bus_ids):
                    bus_id = UUID(bus_ids[selected_index])
                    await create_exit_request(db, user, phone, "bus", bus_id=bus_id, auto_approve=True)
                    state.state = ConversationStateEnum.idle
                    db.commit()
                    send_whatsapp_message(phone, translate("bus_confirmed", lang))
                else:
                    send_whatsapp_message(phone, translate("invalid_bus", lang))


    elif user.role == "parent":
        lang = "ar" if any("\u0600" <= ch <= "\u06FF" for ch in text) else "en"
        otp_input = text.replace("approve", "").strip()

        otp = db.query(OTP).filter(
            OTP.user_id == user.id,
            OTP.otp_code == otp_input,
            OTP.is_verified == False,
            OTP.expires_at > datetime.utcnow()
        ).first()

        if otp:
            links = db.query(ParentStudentLink).filter_by(parent_id=user.id).all()
            approved_any = False
            otp.is_verified = True
            for link in links:
                request = db.query(ExitRequest).filter_by(student_id=link.student_id, status="pending").order_by(ExitRequest.requested_at.desc()).first()
                if request:
                    print(f"ExitRequest id={request.id}, student_id={request.student_id}, status={request.status}")
                    request.parent_id = user.id
                    request.status = "approved"
                    request.approved_at = datetime.utcnow()
                    db.commit()
                    student = db.query(User).get(request.student_id)
                    if student:
                        print(f"User id={student.id}, name={student.full_name}, phone={student.phone_number}")
                        send_whatsapp_message(student.phone_number, translate("student_notified", lang))
                    approved_any = True

            if approved_any:
                send_whatsapp_message(phone, translate("parent_approved", lang))
            else:
                send_whatsapp_message(phone, translate("otp_no_requests", lang))
            db.commit()
        else:
            links = db.query(ParentStudentLink).filter_by(parent_id=user.id).all()
            if not links:
                send_whatsapp_message(phone, translate("not_linked", lang))
                return
            students = db.query(User).filter(User.id.in_([l.student_id for l in links])).all()
            names = "\n".join([f"• {s.name}" for s in students])
            send_whatsapp_message(phone, translate("intro_list", lang, students=names))

async def create_exit_request(db: Session, user: User, phone: str, method: str, bus_id=None, relative_name=None, auto_approve=False):
    req = ExitRequest(
        id=uuid4(),
        student_id=user.id,
        parent_id=None,
        bus_id=bus_id,
        exit_method=method,
        relative_name=relative_name,
        status="approved" if auto_approve else "pending",
        approved_at=datetime.utcnow() if auto_approve else None,
        requested_at=datetime.utcnow()
    )
    db.add(req)
    db.commit()

    if auto_approve:
        return

    link = db.query(ParentStudentLink).filter_by(student_id=user.id).first()
    if not link:
        send_whatsapp_message(phone, translate("no_parent", "en"))
        return

    parent = db.query(User).get(link.parent_id)
    code = generate_random_otp()
    otp = OTP(
        id=uuid4(),
        user_id=parent.id,
        otp_code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=5),
        is_verified=False
    )
    db.add(otp)
    db.commit()
    
    relative_info = f" مع {relative_name}" if relative_name else ""
    BOT_PHONE = "96878788804"  # Replace with your WhatsApp Business number (no '+' or leading zeros)

    await send_sms(
        parent.phone_number,
        f"طلب خروج من {user.name}{relative_info}، رمز الموافقة: {code}\n\n"
        f"اضغط هنا لفتح المحادثة في واتساب: https://wa.me/{BOT_PHONE}?text={code}"
    )
    
    send_whatsapp_message(phone, translate("otp_sent", "en"))
    await send_approve_request(parent.phone_number, user.name)
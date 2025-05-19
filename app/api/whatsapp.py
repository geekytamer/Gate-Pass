from fastapi import APIRouter, Request, Depends, BackgroundTasks, Query
from sqlalchemy.orm import Session
from uuid import uuid4
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
from app.services.whatsapp import send_whatsapp_message, send_whatsapp_template_with_qr_link
from app.services.sms_service import send_sms
from app.core.security import generate_random_otp
from app.core.config import settings
from app.models.conversation_state import ConversationStateEnum
from app.models.conversation_state import ConversationStateEnum
from sqlalchemy import and_


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
    text = msg["text"]["body"].strip().lower()
    user = db.query(User).filter_by(phone_number=phone).first()
    if not user:
        return

    if user.role == "student":
        state = db.query(ConversationState).filter_by(student_id=user.id).first()
        if not state:
            state = ConversationState(student_id=user.id, state=ConversationStateEnum.idle)
            db.add(state)
            db.commit()

        if text == "cancel":
            state.state = ConversationStateEnum.idle
            db.commit()
            send_whatsapp_message(phone, "✅ Your request has been cancelled.")
            return

        match state.state:
            case ConversationStateEnum.idle:
                if is_exit_request(text):
                    state.state = ConversationStateEnum.awaiting_exit_method
                    db.commit()
                    send_whatsapp_message(phone, "How will you exit?\n1. With a friend or relative\n2. Take a bus\n3. On your own")
                else:
                    send_whatsapp_message(phone, "Send 'request exit' to start. You can cancel anytime by sending 'cancel'.")

            case ConversationStateEnum.awaiting_exit_method:
                method_map = {"1": "relative", "2": "bus", "3": "self"}
                exit_method = method_map.get(text)
                if not exit_method:
                    send_whatsapp_message(phone, "Invalid choice. Reply with 1, 2, or 3.")
                    return

                if exit_method == "bus":
                    buses = db.query(Bus).filter_by(university_id=user.university_id).all()
                    if not buses:
                        # Re-initiate the conversation
                        state.state = ConversationStateEnum.awaiting_exit_method
                        db.commit()

                        send_whatsapp_message(phone, (
                            "❌ No buses available currently.\n\n"
                            "How will you exit?\n"
                            "1. With a friend or relative\n"
                            "2. Take a bus\n"
                            "3. On your own"
                        ))
                        return
                    state.state = ConversationStateEnum.awaiting_bus
                    db.commit()
                    bus_list = "\n".join([f"{i+1}. {b.name} - {b.destination_district}" for i, b in enumerate(buses)])
                    send_whatsapp_message(phone, f"Select your bus:\n{bus_list}")
                else:
                    await create_exit_request(db, user, phone, exit_method)
                    state.state = ConversationStateEnum.idle
                    db.commit()

            case ConversationStateEnum.awaiting_bus:
                buses = db.query(Bus).filter_by(university_id=user.university_id).all()
                selected = None
                if text.isdigit():
                    index = int(text) - 1
                    if 0 <= index < len(buses):
                        selected = buses[index]
                else:
                    for bus in buses:
                        if bus.name.lower() == text:
                            selected = bus
                            break

                if not selected:
                    send_whatsapp_message(phone, "Invalid selection. Choose a valid bus number or name.")
                    return

                await create_exit_request(db, user, phone, "bus", selected.id)
                state.state = ConversationStateEnum.idle
                db.commit()

    elif user.role == "parent":
        otp_input = text.replace("approve", "").strip()

        # Check for valid OTP
        otp = db.query(OTP).filter(
            OTP.user_id == user.id,
            OTP.otp_code == otp_input,
            OTP.is_verified == False,
            OTP.expires_at > datetime.utcnow()
        ).first()

        if otp:
            otp.is_verified = True
            db.commit()

            # Get all students linked to this parent
            links = db.query(ParentStudentLink).filter_by(parent_id=user.id).all()

            approved_any = False
            for link in links:
                request = db.query(ExitRequest).filter_by(
                    student_id=link.student_id,
                    status="pending"
                ).order_by(ExitRequest.requested_at.desc()).first()

                if request:
                    request.parent_id = user.id
                    request.status = "approved"
                    request.approved_at = datetime.utcnow()
                    db.commit()

                    student = db.query(User).get(request.student_id)
                    send_whatsapp_message(student.phone_number, "✅ Your parent has approved your exit request.")
                    approved_any = True

            if approved_any:
                send_whatsapp_message(phone, "✅ Exit request approved.")
            else:
                send_whatsapp_message(phone, "⚠️ OTP matched, but no pending requests found to approve.")
        else:
            # No OTP match — give info about the system and linked students
            links = db.query(ParentStudentLink).filter_by(parent_id=user.id).all()
            if not links:
                send_whatsapp_message(phone, "👋 Hello! This is the GatePass system.\n\nYou are not currently linked to any students. Please contact the university.")
                return

            students = db.query(User).filter(User.id.in_([link.student_id for link in links])).all()
            student_names = "\n".join([f"• {s.name}" for s in students])
            send_whatsapp_message(phone, (
                "👋 Hello! This is the GatePass system.\n\n"
                "You're currently linked to the following student(s):\n"
                f"{student_names}\n\n"
                "✅ When any of them makes an exit request, you'll receive an approval message with a code.\n"
                "❌ Your message didn't match a valid approval code, and there are no pending requests right now.\n"
                "Feel free to reply again later!"
            ))

async def create_exit_request(db: Session, user: User, phone: str, method: str, bus_id=None):
    request = ExitRequest(
        id=uuid4(),
        student_id=user.id,
        parent_id=None,
        bus_id=bus_id,
        exit_method=method,
        status="pending"
    )
    db.add(request)

    link = db.query(ParentStudentLink).filter_by(student_id=user.id).first()
    if not link:
        send_whatsapp_message(phone, "⚠️ No parent linked. Contact admin.")
        return

    parent = db.query(User).get(link.parent_id)
    otp = OTP(
        id=uuid4(),
        user_id=parent.id,
        otp_code=(code := generate_random_otp()),
        expires_at=datetime.utcnow() + timedelta(minutes=5),
        is_verified=False
    )
    db.add(otp)
    db.commit()
    await send_sms(parent.phone_number, f"خروج من {user.name}، رمز الموافقة: {code}")
    send_whatsapp_message(phone, "Request sent to your parent.")
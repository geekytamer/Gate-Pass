from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from pydantic import BaseModel
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from app.db.session import get_db
from app.models.accommodation import Accommodation
from app.models.exit_request import ExitRequest
from app.models.user import ParentStudentLink, User
from app.core.security import get_current_user, get_password_hash
from app.schemas.exit_request import ExitRequestOut
from app.schemas.student import ActivityEntry, ParentInfo, RegisterWithParentInput, StudentCreate, StudentDetailsResponse
from app.services.qr import generate_qr_image
from app.services.whatsapp import send_check_notification, send_whatsapp_template_with_qr_link, upload_qr_to_whatsapp, send_whatsapp_template_with_qr

router = APIRouter()

@router.post("/register-with-parent")
async def register_student_with_parent(
    payload: RegisterWithParentInput,
    db: Session = Depends(get_db),
    authorization: str = Header(...)
):
    user = get_current_user(authorization, db)
    if user.role != "university_admin":  # type: ignore
        raise HTTPException(status_code=403, detail="Unauthorized")

    student_phone = payload.student_phone.lstrip("+")
    parent_phone = payload.parent.phone_number.lstrip("+")

    # Check if student already exists
    if db.query(User).filter(User.phone_number == student_phone).first():
        raise HTTPException(status_code=400, detail="Student already exists")

    # Check if parent exists
    parent = db.query(User).filter(User.phone_number == parent_phone, User.role == "parent").first()
    if not parent:
        parent = User(
            id=uuid4(),
            name=payload.parent.name,
            phone_number=parent_phone,
            role="parent"
        )
        db.add(parent)
        db.flush()  # flush to get parent.id

    # Get accommodation (optional)
    accommodation = None
    if payload.accommodation_id:
        accommodation = db.query(Accommodation).filter(Accommodation.id == payload.accommodation_id).first()
        if not accommodation:
            raise HTTPException(status_code=404, detail="Accommodation not found")

    student_id = uuid4()
    # Create student
    student = User(
        id=student_id,
        name=payload.student_name,
        phone_number=payload.student_phone,
        role="student",
        hashed_password=get_password_hash("1234"),
        accommodation_id=accommodation.id if accommodation else None,
        university_id=user.university_id
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    # Link them
    link = ParentStudentLink(
        id=uuid4(),
        student_id=student.id,
        parent_id=parent.id
    )
    db.add(link)
    db.commit()

    # ✅ Generate QR and get public URL
    qr_url = generate_qr_image(str(student.id))

    # ✅ Send QR message using public URL
    print(await send_whatsapp_template_with_qr_link(
        phone_number=payload.student_phone,
        qr_url=qr_url,
        student_name=student.name
    ))

    return {"message": "Student and parent registered successfully"}

@router.get("/verify/{student_id}")
def verify_scanned_student(student_id: UUID, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    accommodation = db.query(Accommodation).filter(Accommodation.id == student.accommodation_id).first()

    exit_request = db.query(ExitRequest).filter(
        ExitRequest.student_id == student.id,
        ExitRequest.status == "approved"
    ).order_by(ExitRequest.approved_at.desc()).first()

    return {
        "name": student.name,
        "accommodation": accommodation.name if accommodation else None,
        "status": "approved" if exit_request else "not approved"
    }

@router.get("/search")
def search_students(
    query: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    authorization: str = Header(...)
):
    user = get_current_user(authorization, db)
    if user.role != "university_admin": # type: ignore
        raise HTTPException(status_code=403, detail="Unauthorized")

    query_lower = f"%{query.lower()}%"

    parent_links = (
        db.query(ParentStudentLink.student_id, User.name.label("parent_name"))
        .join(User, ParentStudentLink.parent_id == User.id)
        .subquery()
    )

    students = (
        db.query(User, parent_links.c.parent_name)
        .outerjoin(parent_links, User.id == parent_links.c.student_id)
        .filter(
            User.university_id == user.university_id,
            User.role == "student",
            or_(
                func.lower(User.name).like(query_lower),
                func.lower(User.phone_number).like(query_lower),
                func.lower(parent_links.c.parent_name).like(query_lower)
            )
        )
        .all()
    )
    print(students)

    return [
        {
            "id": str(student.id),
            "name": student.name,
            "phone_number": student.phone_number,
            "parent_name": parent_name,
        }
        for student, parent_name in students
    ]

@router.get("/university")
def list_students_for_university_admin(
    db: Session = Depends(get_db),
    authorization: str = Header(...)
):
    user = get_current_user(authorization, db)  # utility that uses decode_access_token()

    if user.role != "university_admin": # type: ignore
        raise HTTPException(status_code=403, detail="Not authorized")

    students = db.query(User).filter(
        User.role == "student",
        User.university_id == user.university_id
    ).all()

    results = []
    for student in students:
        results.append({
            "id": str(student.id),
            "name": student.name,
            "phone_number": student.phone_number,
            "accommodation_name": student.accommodation.name if student.accommodation else None
        })

    return results

@router.get("/{student_id}/latest-request", response_model=Optional[ExitRequestOut])
def get_latest_exit_request(student_id: UUID, db: Session = Depends(get_db)):
    request = (
        db.query(ExitRequest)
        .filter(ExitRequest.student_id == student_id)
        .order_by(ExitRequest.requested_at.desc())
        .first()
    )

    return request  # Returns None if no request found

@router.get("/{student_id}/activity-log", response_model=list[ExitRequestOut])
def get_activity_log(student_id: UUID, db: Session = Depends(get_db)):
    logs = (
        db.query(ExitRequest)
        .filter(ExitRequest.student_id == student_id)
        .order_by(ExitRequest.requested_at.desc())
        .all()
    )
    
    if not logs:
        return [] 

    return logs

    
@router.get("/{student_id}/details", response_model=StudentDetailsResponse)
def get_student_details(student_id: UUID, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    parent_link = db.query(ParentStudentLink).filter(ParentStudentLink.student_id == student.id).first()
    parent = db.query(User).filter(User.id == parent_link.parent_id).first() if parent_link else None

    latest_request = db.query(ExitRequest)\
        .filter(ExitRequest.student_id == student.id)\
        .order_by(ExitRequest.requested_at.desc())\
        .first()

    activity = db.query(ExitRequest)\
        .filter(ExitRequest.student_id == student.id)\
        .order_by(ExitRequest.requested_at.desc())\
        .limit(10)\
        .all()

    return StudentDetailsResponse(
        id=student.id,
        name=student.name,
        phone_number=student.phone_number,
        accommodation=student.accommodation.name if student.accommodation else None,
        parent=ParentInfo(
            id=parent.id,
            name=parent.name,
            phone_number=parent.phone_number
        ) if parent else None,
        current_request=ExitRequestOut(
            id=latest_request.id,
            exit_method=latest_request.exit_method,
            status=latest_request.status,
            requested_at=latest_request.requested_at,
            approved_at=latest_request.approved_at
        ).model_dump() if latest_request else None,
        activity_log=[
            ActivityEntry(
                exit_method=req.exit_method,
                status=req.status,
                requested_at=req.requested_at
            ) for req in activity
        ]
    )
    
@router.delete("/{id}")
def delete_student(id: UUID, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return {"message": "Student deleted"}

class UpdateStudentInput(BaseModel):
    name: str
    phone_number: str
    accommodation_id: UUID | None = None
    parent_name: str
    parent_phone: str


@router.put("/{student_id}")
def update_student(
    student_id: UUID,
    payload: UpdateStudentInput,
    authorization: str = Header(...)
):
    current_user = get_current_user(authorization)

    if current_user.role != "university_admin":  # type: ignore
        raise HTTPException(status_code=403, detail="Access denied")    
    
    # 2. DB session
    with get_db() as db:

        student = db.query(User).filter(User.id == student_id, User.role == "student").first()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        # Update student basic info
        student.name = payload.name
        student.phone_number = payload.phone_number
        student.accommodation_id = payload.accommodation_id

        # Handle parent
        existing_parent = db.query(User).filter(
            User.phone_number == payload.parent_phone,
            User.role == "parent"
        ).first()

        if existing_parent:
            student.parent_id = existing_parent.id
        else:
            # Update or create parent
            if student.parent_id:
                parent = db.query(User).filter(User.id == student.parent_id).first()
                if parent:
                    parent.name = payload.parent_name
                    parent.phone_number = payload.parent_phone
                else:
                    new_parent = User(
                        name=payload.parent_name,
                        phone_number=payload.parent_phone,
                        role="parent"
                    )
                    db.add(new_parent)
                    db.flush()
                    student.parent_id = new_parent.id
            else:
                new_parent = User(
                    name=payload.parent_name,
                    phone_number=payload.parent_phone,
                    role="parent"
                )
                db.add(new_parent)
                db.flush()
                student.parent_id = new_parent.id

        db.commit()
        return {"message": "✅ Student updated successfully"}

@router.post("/{student_id}/check-out")
async def check_out_student(student_id: UUID, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    request = (
        db.query(ExitRequest)
        .filter(ExitRequest.student_id == student_id, ExitRequest.status == "approved")
        .order_by(ExitRequest.requested_at.desc())
        .first()
    )
    if not request:
        raise HTTPException(status_code=404, detail="No approved exit request")

    request.status = "completed"
    db.commit()

    parent_link = db.query(ParentStudentLink).filter(ParentStudentLink.student_id == student.id).first()
    if parent_link:
        parent = db.query(User).filter(User.id == parent_link.parent_id).first()
        if parent:
            await send_check_notification(parent.phone_number, student.name, "out")

    return {"message": "Student checked out and parent notified"}


@router.post("/{student_id}/check-in")
async def check_in_student(student_id: UUID, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    request = (
        db.query(ExitRequest)
        .filter(ExitRequest.student_id == student_id, ExitRequest.status == "completed")
        .order_by(ExitRequest.requested_at.desc())
        .first()
    )
    if not request:
        raise HTTPException(status_code=404, detail="No completed exit request to check in")

    request.status = "returned"
    request.approved_at = datetime.utcnow()
    db.commit()

    parent_link = db.query(ParentStudentLink).filter(ParentStudentLink.student_id == student.id).first()
    if parent_link:
        parent = db.query(User).filter(User.id == parent_link.parent_id).first()
        if parent:
            await send_check_notification(parent.phone_number, student.name, "in")

    return {"message": "Student checked in and parent notified"}

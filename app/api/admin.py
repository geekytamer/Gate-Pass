from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID, uuid4

from app.db.session import get_db
from app.core.security import get_current_user, get_password_hash
from app.models.user import User, UserRole
from app.models.university import University

def require_main_admin(user: User = Depends(get_current_user)):
    if user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return user

router = APIRouter()


# 🏫 Create a university
@router.post("/universities")
def create_university(payload: dict, db: Session = Depends(get_db)):
    uni = University(id=uuid4(), name=payload["name"])
    db.add(uni)
    db.commit()
    db.refresh(uni)
    return {"id": str(uni.id), "name": uni.name}


# ✏️ Update a specific university
@router.put("/universities/{university_id}")
def update_university(university_id: UUID, payload: dict, db: Session = Depends(get_db)):
    uni = db.query(University).filter_by(id=university_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")
    uni.name = payload["name"]
    db.commit()
    db.refresh(uni)
    return {"id": str(uni.id), "name": uni.name}


# ❌ Delete a specific university
@router.delete("/universities/{university_id}", status_code=204)
def delete_university(university_id: UUID, db: Session = Depends(get_db)):
    uni = db.query(University).filter_by(id=university_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")
    db.delete(uni)
    db.commit()
    return


# 📋 List universities
@router.get("/universities")
def list_universities(db: Session = Depends(get_db)):
    return [{"id": str(u.id), "name": u.name} for u in db.query(University).all()]


# 🏫 Get a specific university
@router.get("/universities/{university_id}")
def get_university(university_id: UUID, db: Session = Depends(get_db)):
    uni = db.query(University).filter_by(id=university_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University not found")
    return {"id": str(uni.id), "name": uni.name}


# 👥 List students for a university
@router.get("/universities/{university_id}/students")
def list_university_students(university_id: UUID, db: Session = Depends(get_db)):
    return [
        {
            "id": str(u.id),
            "name": u.name,
            "phone_number": u.phone_number,
            "role": u.role.value,
        }
        for u in db.query(User).filter(
            User.university_id == university_id,
            User.role == UserRole.student
        ).all()
    ]


# 👤 List staff members for a university
@router.get("/universities/{university_id}/staff")
def list_staff(university_id: UUID, db: Session = Depends(get_db)):
    return [
        {
            "id": str(u.id),
            "name": u.name,
            "phone_number": u.phone_number,
            "role": u.role.value,
        }
        for u in db.query(User).filter(
            User.university_id == university_id,
            User.role.in_([UserRole.staff, UserRole.university_admin])
        ).all()
    ]


# 👤 Get a specific staff member
@router.get("/universities/{university_id}/staff/{staff_id}")
def get_staff(university_id: UUID, staff_id: UUID, db: Session = Depends(get_db)):
    staff = db.query(User).filter(
        User.university_id == university_id,
        User.id == staff_id,
        User.role.in_([UserRole.staff, UserRole.university_admin])
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return {
        "id": str(staff.id),
        "name": staff.name,
        "phone_number": staff.phone_number,
        "role": staff.role.value,
    }


# 🔧 Create university staff
@router.post("/universities/{university_id}/staff")
def create_staff_for_university(university_id: UUID, payload: dict, db: Session = Depends(get_db)):
    user = User(
        id=uuid4(),
        name=payload["name"],
        phone_number=payload["phone_number"],
        hashed_password = get_password_hash(payload["hashed_password"]),
        role=UserRole(payload["role"]),
        university_id=university_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "id": str(user.id),
        "name": user.name,
        "phone_number": user.phone_number,
        "role": user.role.value,
    }


# ✏️ Update a staff member
@router.put("/universities/{university_id}/staff/{staff_id}")
def update_staff(university_id: UUID, staff_id: UUID, payload: dict, db: Session = Depends(get_db)):
    staff = db.query(User).filter(
        User.university_id == university_id,
        User.id == staff_id,
        User.role.in_([UserRole.staff, UserRole.university_admin])
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    staff.name = payload["name"]
    staff.phone_number = payload["phone_number"]
    staff.hashed_password = payload["hashed_password"]
    staff.role = UserRole(payload["role"])
    db.commit()
    db.refresh(staff)
    return {
        "id": str(staff.id),
        "name": staff.name,
        "phone_number": staff.phone_number,
        "role": staff.role.value,
    }


# ❌ Delete staff member
@router.delete("/universities/{university_id}/staff/{staff_id}", status_code=204)
def delete_staff(university_id: UUID, staff_id: UUID, db: Session = Depends(get_db)):
    staff = db.query(User).filter(
        User.university_id == university_id,
        User.id == staff_id,
        User.role.in_([UserRole.staff, UserRole.university_admin])
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    db.delete(staff)
    db.commit()
    return


# 🏢 View accommodations
@router.get("/universities/{university_id}/accommodations")
def list_accommodations(university_id: UUID, db: Session = Depends(get_db)):
    from app.models.accommodation import Accommodation
    accs = db.query(Accommodation).filter_by(university_id=university_id).all()
    return [{"id": str(acc.id), "name": acc.name} for acc in accs]


# 🚍 View buses
@router.get("/universities/{university_id}/buses")
def list_buses(university_id: UUID, db: Session = Depends(get_db)):
    from app.models.bus import Bus
    buses = db.query(Bus).filter_by(university_id=university_id).all()
    return [{"id": str(b.id), "name": b.name, "destination": b.destination_district} for b in buses]


# 📊 System statistics
@router.get("/statistics")
def get_system_statistics(db: Session = Depends(get_db)):
    from app.models.accommodation import Accommodation
    from app.models.bus import Bus
    return {
        "universities": db.query(University).count(),
        "students": db.query(User).filter(User.role == UserRole.student).count(),
        "staff": db.query(User).filter(User.role.in_([UserRole.staff, UserRole.university_admin])).count(),
        "accommodations": db.query(Accommodation).count(),
        "buses": db.query(Bus).count(),
    }
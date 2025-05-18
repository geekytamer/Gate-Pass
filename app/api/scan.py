from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.exit_request import ExitRequest
from datetime import datetime

router = APIRouter()

@router.post("/scan")
def scan_student_qr(student_id: str, action: str, db: Session = Depends(get_db)):
    if action not in ["checkin", "checkout"]:
        raise HTTPException(status_code=400, detail="Invalid action type")

    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    exit_request = db.query(ExitRequest).filter(
        ExitRequest.student_id == student.id
    ).order_by(ExitRequest.requested_at.desc()).first()

    if action == "checkout":
        if exit_request and exit_request.status == "approved":
            exit_request.status = "completed"
            exit_request.approved_at = datetime.utcnow()
            db.commit()
            method = exit_request.exit_method if hasattr(exit_request, "exit_method") and exit_request.exit_method else "unknown"
            return {"status": "success", "message": f"Student checked out (method: {method})"}
        else:
            return {"status": "error", "message": "No valid approved exit request"}

    elif action == "checkin":
        if exit_request and exit_request.status == "completed":
            exit_request.status = "returned"
            db.commit()
            method = exit_request.exit_method if hasattr(exit_request, "exit_method") and exit_request.exit_method else "unknown"
            return {"status": "success", "message": f"Student checked in (method: {method})"}
        else:
            return {"status": "error", "message": "No record of student exiting"}
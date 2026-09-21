from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from core.security import get_current_user
from models.user import User
import crud.academic as crud_academic
import schemas.schemas as schemas

router = APIRouter()

@router.get("/timetable", response_model=List[schemas.TimetableEventResponse])
def get_timetable(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.tenant_id:
        return []
    return crud_academic.get_timetable_by_tenant(db, current_user.tenant_id)

@router.get("/attendance", response_model=List[schemas.AttendanceRecordResponse])
def get_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_academic.get_student_attendance(db, current_user.id)

@router.get("/leave-requests", response_model=List[schemas.LeaveRequestResponse])
def get_leave_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_academic.get_student_leave_requests(db, current_user.id)

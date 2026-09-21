from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from core.security import get_current_user
from models.user import User
import crud.career as crud_career
import schemas.schemas as schemas

router = APIRouter()

@router.get("/jobs", response_model=List[schemas.JobListingResponse])
def get_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.tenant_id:
        return []
    return crud_career.get_jobs(db, current_user.tenant_id)

@router.get("/applications", response_model=List[schemas.JobApplicationResponse])
def get_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_career.get_student_applications(db, current_user.id)

@router.get("/certificates", response_model=List[schemas.CertificateResponse])
def get_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_career.get_student_certificates(db, current_user.id)

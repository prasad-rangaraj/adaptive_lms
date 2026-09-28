from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from db.database import get_db
from core.security import get_current_user
from models.user import User
import crud.career as crud_career
import schemas.schemas as schemas

router = APIRouter()

@router.get("/skills")
def get_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from models.cognitive_profile import CognitiveProfile
    from models.enrollment import Enrollment
    from models.course import Course

    prof = db.query(CognitiveProfile).filter(CognitiveProfile.user_id == current_user.id).first()
    strong_areas = set(prof.strength_areas or []) if prof else set()
    weak_areas = set(prof.weak_areas or []) if prof else set()

    # Build skills from actual enrolled courses
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == current_user.id).all()
    skills = []
    seen_ids = set()

    for en in enrollments:
        course = en.course
        if not course or course.id in seen_ids:
            continue
        seen_ids.add(course.id)

        prog = en.progress_percentage or 0
        if prog >= 90:
            status = "mastered"
        elif prog > 0:
            status = "in-progress"
        else:
            status = "locked"

        skills.append({
            "id": f"course_{course.id}",
            "name": course.title,
            "status": status,
            "score": int(prog)
        })

    # Prepend AI-identified strong areas
    for i, area in enumerate(sorted(strong_areas)):
        skills.insert(0, {"id": f"strong_{i}", "name": area, "status": "mastered", "score": 98})

    # Append weak areas as improvement targets
    for i, area in enumerate(sorted(weak_areas)):
        skills.append({"id": f"weak_{i}", "name": area, "status": "in-progress", "score": 30})

    return skills

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

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from core.security import get_current_user
from models.assignment import Assignment, AssignmentSubmission
from models.user import User
from tasks.ai_tasks import evaluate_assignment_submission
from schemas.schemas import AssignmentSubmissionResponse
from typing import List
import boto3
from core.config import settings
import uuid

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
    )


@router.post("/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Student submits an assignment file.
    Uploads to S3 and dispatches a Celery task for AI evaluation
    (OCR → Grammar → Plagiarism → AI Detection → Rubric Grading).
    """
    from models.course import Course
    assignment = db.query(Assignment).join(Course, Course.id == Assignment.course_id).filter(
        Assignment.id == assignment_id,
        Assignment.is_published == True,
        Course.tenant_id == current_user.tenant_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Upload to S3
    file_ext = file.filename.split(".")[-1]
    s3_key = f"submissions/user_{current_user.id}/assignment_{assignment_id}/{uuid.uuid4()}.{file_ext}"
    s3 = get_s3_client()
    s3.upload_fileobj(file.file, settings.S3_BUCKET_NAME, s3_key)
    s3_url = f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{s3_key}"

    # Create submission record
    submission = AssignmentSubmission(
        assignment_id=assignment_id,
        student_id=current_user.id,
        file_url=s3_url,
        status="submitted",
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    # Trigger background AI evaluation
    evaluate_assignment_submission.delay(submission.id)

    return {
        "message": "Assignment submitted. AI evaluation in progress.",
        "submission_id": submission.id,
    }


@router.get("/{assignment_id}/submissions/{submission_id}")
async def get_submission_result(
    assignment_id: int,
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve AI evaluation results for a submission."""
    from models.course import Course
    submission = db.query(AssignmentSubmission).join(
        Assignment, Assignment.id == AssignmentSubmission.assignment_id
    ).join(
        Course, Course.id == Assignment.course_id
    ).filter(
        AssignmentSubmission.id == submission_id,
        AssignmentSubmission.student_id == current_user.id,
        Course.tenant_id == current_user.tenant_id
    ).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    return {
        "submission_id": submission.id,
        "status": submission.status,
        "ai_score": submission.ai_score,
        "grammar_score": submission.grammar_score,
        "plagiarism_score": submission.plagiarism_score,
        "ai_generated_probability": submission.ai_generated_probability,
        "logic_score": submission.logic_score,
        "feedback": submission.feedback_json,
        "final_score": submission.final_score,
    }

@router.get("/{assignment_id}/submissions", response_model=List[AssignmentSubmissionResponse])
async def get_all_submissions(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user), # should require teacher role
):
    from models.course import Course
    from core.security import require_role
    
    # Check if user is a teacher or tenant admin
    if current_user.role not in ["teacher", "tenant_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    assignment = db.query(Assignment).join(Course, Course.id == Assignment.course_id).filter(
        Assignment.id == assignment_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    # Teachers can only view submissions for their own courses
    if current_user.role == "teacher" and assignment.course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this course")
        
    return db.query(AssignmentSubmission).filter(AssignmentSubmission.assignment_id == assignment_id).all()

from pydantic import BaseModel
class GradeSubmissionRequest(BaseModel):
    final_score: float
    teacher_feedback: str

@router.patch("/{assignment_id}/submissions/{submission_id}/grade", response_model=AssignmentSubmissionResponse)
async def grade_submission(
    assignment_id: int,
    submission_id: int,
    payload: GradeSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from models.course import Course
    
    if current_user.role not in ["teacher", "tenant_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    submission = db.query(AssignmentSubmission).join(
        Assignment, Assignment.id == AssignmentSubmission.assignment_id
    ).join(
        Course, Course.id == Assignment.course_id
    ).filter(
        AssignmentSubmission.id == submission_id,
        AssignmentSubmission.assignment_id == assignment_id,
        Course.tenant_id == current_user.tenant_id
    ).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    if current_user.role == "teacher" and submission.assignment.course.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to grade this course")
        
    submission.final_score = payload.final_score
    submission.teacher_feedback = payload.teacher_feedback
    submission.status = "evaluated"
    
    db.commit()
    db.refresh(submission)
    return submission

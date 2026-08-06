from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from models.assignment import Assignment, AssignmentSubmission
from models.user import User
from tasks.ai_tasks import evaluate_assignment_submission
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
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.is_published == True,
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
    submission = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.id == submission_id,
        AssignmentSubmission.student_id == current_user.id,
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

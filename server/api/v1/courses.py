from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from db.database import get_db
from core.security import get_current_user, require_role
from models.course import Course, CourseMaterial
from models.user import User
from schemas.schemas import CourseCreateRequest, CourseResponse, CourseMaterialResponse
from tasks.ai_tasks import process_material_embeddings
from typing import List
import boto3
from core.config import settings
import uuid

router = APIRouter(prefix="/api/courses", tags=["Courses"])


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
    )


@router.post("/", response_model=CourseResponse, status_code=201)
async def create_course(
    payload: CourseCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin")),
):
    """Teacher/Admin: Create a new course under their tenant."""
    course = Course(
        tenant_id=current_user.tenant_id,
        teacher_id=current_user.id,
        **payload.model_dump(),
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get("/", response_model=List[CourseResponse])
async def list_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all published courses within the current user's tenant."""
    return db.query(Course).filter(
        Course.tenant_id == current_user.tenant_id,
        Course.is_published == True,
    ).all()


@router.get("/enrolled", response_model=List[CourseResponse])
async def list_enrolled_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List courses the current student is enrolled in."""
    from models.enrollment import Enrollment
    enrollments = db.query(Enrollment).filter(Enrollment.student_id == current_user.id).all()
    course_ids = [e.course_id for e in enrollments]
    if not course_ids:
        return []
    
    return db.query(Course).filter(
        Course.id.in_(course_ids),
        Course.is_published == True
    ).all()


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single course. Enforces tenant isolation."""
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,  # Tenant Isolation
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/{course_id}/materials", response_model=List[CourseMaterialResponse])
async def list_course_materials(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List materials for a course. Basic check ensures tenant isolation."""
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return db.query(CourseMaterial).filter(
        CourseMaterial.course_id == course_id
    ).order_by(CourseMaterial.order_index.asc()).all()


@router.post("/{course_id}/materials/upload")
async def upload_material(
    course_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin")),
):
    """
    Upload a course material file (PDF, video) to MinIO/S3.
    After upload, triggers a Celery background task to extract text
    and generate pgvector embeddings for the AI Tutor.
    """
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Generate unique S3 key
    file_ext = file.filename.split(".")[-1]
    s3_key = f"tenant_{current_user.tenant_id}/course_{course_id}/{uuid.uuid4()}.{file_ext}"

    # Upload to MinIO/S3
    s3 = get_s3_client()
    s3.upload_fileobj(file.file, settings.S3_BUCKET_NAME, s3_key)
    s3_url = f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{s3_key}"

    # Determine material type
    mat_type = "pdf" if file_ext == "pdf" else "video" if file_ext in ["mp4", "webm"] else "doc"

    # Save material record
    material = CourseMaterial(
        course_id=course_id,
        title=file.filename,
        material_type=mat_type,
        s3_url=s3_url,
        is_processed=False,
    )
    db.add(material)
    db.commit()
    db.refresh(material)

    # Trigger Celery background task to process embeddings
    process_material_embeddings.delay(material.id, current_user.tenant_id)

    return {
        "message": "File uploaded successfully. AI indexing in progress.",
        "material_id": material.id,
        "s3_url": s3_url,
    }


@router.patch("/{course_id}/publish")
async def publish_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin")),
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.is_published = True
    db.commit()
    return {"message": "Course published successfully"}

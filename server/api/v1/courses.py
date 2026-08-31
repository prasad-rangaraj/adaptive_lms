from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from db.database import get_db
from core.security import get_current_user, require_role
from models.course import Course, CourseMaterial, CourseModule
from models.assignment import Assignment
from models.user import User
from schemas.schemas import CourseCreateRequest, CourseResponse, CourseMaterialResponse, CourseModuleCreateRequest, CourseModuleResponse, AssignmentCreateRequest, AssignmentResponse
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
    """
    List courses within the current user's tenant.
    - Students: only published courses
    - Teachers/Admins: published courses + their own drafts
    """
    q = db.query(Course).filter(Course.tenant_id == current_user.tenant_id)
    if current_user.role in ("teacher", "tenant_admin", "super_admin"):
        # Teachers see all published courses + their own unpublished
        from sqlalchemy import or_
        q = q.filter(or_(Course.is_published == True, Course.teacher_id == current_user.id))
    else:
        q = q.filter(Course.is_published == True)
    return q.order_by(Course.id.desc()).all()


@router.get("/my", response_model=List[CourseResponse])
async def list_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin")),
):
    """Teacher: list only their own courses (including drafts)."""
    return db.query(Course).filter(
        Course.tenant_id == current_user.tenant_id,
        Course.teacher_id == current_user.id,
    ).order_by(Course.id.desc()).all()


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


@router.get("/{course_id}/modules", response_model=List[CourseModuleResponse])
async def list_course_modules(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all modules (and their materials) for a course."""
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return db.query(CourseModule).filter(CourseModule.course_id == course_id).order_by(CourseModule.order_index.asc()).all()


@router.post("/{course_id}/modules", response_model=CourseModuleResponse)
async def create_course_module(
    course_id: int,
    payload: CourseModuleCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin")),
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # get max order index
    max_order = db.query(CourseModule).filter(CourseModule.course_id == course_id).count()

    module = CourseModule(
        course_id=course_id,
        title=payload.title,
        order_index=max_order
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.post("/{course_id}/modules/{module_id}/materials/upload")
async def upload_material(
    course_id: int,
    module_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin")),
):
    """
    Upload a course material file to a module.
    """
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    module = db.query(CourseModule).filter(CourseModule.id == module_id, CourseModule.course_id == course_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    # Generate unique S3 key
    file_ext = file.filename.split(".")[-1]
    s3_key = f"tenant_{current_user.tenant_id}/course_{course_id}/module_{module_id}/{uuid.uuid4()}.{file_ext}"

    # Upload to MinIO/S3
    s3 = get_s3_client()
    s3.upload_fileobj(file.file, settings.S3_BUCKET_NAME, s3_key)
    s3_url = f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{s3_key}"

    # Determine material type
    mat_type = "pdf" if file_ext == "pdf" else "video" if file_ext in ["mp4", "webm"] else "doc"

    max_order = db.query(CourseMaterial).filter(CourseMaterial.module_id == module_id).count()

    # Save material record
    material = CourseMaterial(
        module_id=module_id,
        title=file.filename,
        material_type=mat_type,
        s3_url=s3_url,
        order_index=max_order,
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


@router.get("/{course_id}/assignments", response_model=List[AssignmentResponse])
async def list_course_assignments(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return db.query(Assignment).filter(Assignment.course_id == course_id).all()


@router.post("/{course_id}/assignments", response_model=AssignmentResponse)
async def create_course_assignment(
    course_id: int,
    payload: AssignmentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin")),
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    assignment = Assignment(
        course_id=course_id,
        **payload.model_dump()
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


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

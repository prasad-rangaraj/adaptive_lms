from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from db.database import get_db
from core.security import get_current_user, require_role
from models.course import Course, CourseMaterial, CourseModule
from models.enrollment import Enrollment
from models.assignment import Assignment
from models.user import User
from models.cognitive_profile import CognitiveProfile
from models.vector_embedding import VectorEmbedding
from schemas.schemas import (
    CourseCreateRequest, CourseResponse, CourseMaterialResponse, CourseUpdateRequest,
    CourseModuleCreateRequest, CourseModuleResponse, CourseModuleUpdateRequest,
    AssignmentCreateRequest, AssignmentResponse,
    EnrollResponse, EnrollmentStatusResponse,
    PlacementResultRequest, PlacementResultResponse,
)
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


@router.get("/recommended-paths")
async def get_recommended_paths(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Dynamically generates learning paths by grouping courses by category,
    and calculating a match score based on the user's CognitiveProfile.
    """
    # 1. Get user's cognitive profile
    profile = db.query(CognitiveProfile).filter(CognitiveProfile.user_id == current_user.id).first()
    base_match = 75
    if profile:
        # Simple dynamic calculation based on focus and retention
        base_match = int((profile.focus_score + profile.retention_score) / 2)
        if base_match == 0:
            base_match = 80 # default if empty

    # 2. Get all published courses
    courses = db.query(Course).filter(
        Course.tenant_id == current_user.tenant_id,
        Course.is_published == True
    ).all()

    # 3. Group by category
    categories = {}
    for c in courses:
        cat = c.category or "General Core"
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(c)

    # 4. Format paths
    paths = []
    idx = 1
    for cat, cat_courses in categories.items():
        # Introduce some variation based on category length
        match_score = min(100, base_match + (len(cat_courses) * 2))
        
        paths.append({
            "id": f"path-{idx}",
            "title": f"{cat} Track",
            "duration": f"{len(cat_courses) * 4} Weeks",
            "courses": len(cat_courses),
            "match": match_score,
            "tags": [cat_courses[0].difficulty.capitalize() if cat_courses[0].difficulty else "All Levels", cat],
            "description": f"Master {cat} with this curated series of {len(cat_courses)} interactive courses."
        })
        idx += 1

    # Sort by match score descending
    paths.sort(key=lambda x: x["match"], reverse=True)
    return paths


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


@router.get("/my")
async def list_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin")),
):
    """Teacher: list only their own courses (including drafts) with student and module counts."""
    from models.enrollment import Enrollment
    from sqlalchemy import func as sqlfunc

    courses = db.query(Course).filter(
        Course.tenant_id == current_user.tenant_id,
        Course.teacher_id == current_user.id,
    ).order_by(Course.id.desc()).all()

    result = []
    for c in courses:
        enr_count = db.query(Enrollment).filter(Enrollment.course_id == c.id).count()
        mod_count = db.query(CourseModule).filter(CourseModule.course_id == c.id).count() if hasattr(Course, 'modules') else 0
        result.append({
            "id": c.id,
            "tenant_id": c.tenant_id,
            "title": c.title,
            "description": c.description,
            "thumbnail_url": c.thumbnail_url,
            "category": c.category,
            "difficulty": c.difficulty,
            "is_published": c.is_published,
            "price": c.price,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "modules": [],
            "enrollment_count": enr_count,
            "modules_count": mod_count,
        })
    return result


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

@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: int,
    payload: CourseUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin", "super_admin")),
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    if payload.title is not None:
        course.title = payload.title
    if payload.description is not None:
        course.description = payload.description
        
    db.commit()
    db.refresh(course)
    return course

@router.get("/{course_id}/modules", response_model=List[CourseModuleResponse])
async def list_course_modules(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all modules (and their materials) for a course, including level."""
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    modules = db.query(CourseModule).filter(CourseModule.course_id == course_id).order_by(CourseModule.order_index.asc()).all()
    
    result = []
    for m in modules:
        result.append({
            "id": m.id,
            "course_id": m.course_id,
            "title": m.title,
            "order_index": m.order_index,
            "level": m.level or "fundamentals",
            "materials": m.materials,
            "materials_count": len(m.materials),
        })
    return result


@router.get("/{course_id}/course-detail")
async def get_course_detail(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Teacher: Get course modules grouped by level + enrolled students in one request."""
    from models.enrollment import Enrollment

    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Modules grouped by level
    levels = ["fundamentals", "beginner", "intermediate", "advanced"]
    modules_raw = db.query(CourseModule).filter(CourseModule.course_id == course_id).order_by(CourseModule.order_index.asc()).all()

    grouped = {lv: [] for lv in levels}
    for m in modules_raw:
        lv = m.level if m.level in levels else "fundamentals"
        grouped[lv].append({
            "id": m.id,
            "title": m.title,
            "order_index": m.order_index,
            "materials_count": len(m.materials),
            "materials": [{
                "id": mat.id,
                "title": mat.title,
                "type": mat.material_type,
                "url": mat.s3_url,
                "duration": f"{int(mat.duration_seconds // 60)}m" if mat.duration_seconds else None
            } for mat in m.materials]
        })

    # Students with adaptive path info
    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    students = []
    for en in enrollments:
        if en.student:
            students.append({
                "id": en.student.id,
                "name": en.student.full_name,
                "email": en.student.email,
                "learning_path": en.learning_path or "pending",
                "progress": round(en.progress_percentage or 0, 1),
                "placement_score": en.placement_score,
                "status": "On Track" if (en.progress_percentage or 0) >= 50 else "Falling Behind",
            })

    # Group students by path
    students_by_path = {lv: [] for lv in ["pending", "fundamentals", "basics", "intermediate", "advanced"]}
    for s in students:
        p = s["learning_path"]
        if p not in students_by_path:
            students_by_path[p] = []
        students_by_path[p].append(s)

    return {
        "course": {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "difficulty": course.difficulty,
            "is_published": course.is_published,
            "category": course.category,
        },
        "modules_by_level": grouped,
        "students_by_path": students_by_path,
        "total_students": len(students),
        "level_counts": {lv: len(grouped[lv]) for lv in levels},
    }

@router.get("/{course_id}/students")
async def list_course_students(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all students enrolled in a specific course."""
    course = db.query(Course).filter(Course.id == course_id, Course.tenant_id == current_user.tenant_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    from models.enrollment import Enrollment
    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course_id).all()
    
    students = []
    for en in enrollments:
        if en.student:
            students.append({
                "id": en.student.id,
                "name": en.student.full_name,
                "email": en.student.email,
                "progress": en.progress_percentage,
                "status": "On Track" if en.progress_percentage >= 50 else "Falling Behind",
                "learning_path": en.learning_path,
                "placement_score": en.placement_score,
                "lastActive": "Recently" # Stubbed since we don't have last_login
            })
    return students

@router.get("/{course_id}/materials/{material_id}/transcript")
async def get_material_transcript(
    course_id: int,
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    embeddings = db.query(VectorEmbedding).filter(
        VectorEmbedding.course_id == course_id,
        VectorEmbedding.material_id == material_id
    ).order_by(VectorEmbedding.chunk_index.asc()).all()

    return [{"text": e.text_chunk} for e in embeddings]


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
        order_index=max_order,
        level=payload.level
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.patch("/{course_id}/modules/{module_id}", response_model=CourseModuleResponse)
async def update_course_module(
    course_id: int,
    module_id: int,
    payload: CourseModuleUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("teacher", "tenant_admin", "super_admin")),
):
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    module = db.query(CourseModule).filter(CourseModule.id == module_id, CourseModule.course_id == course_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
        
    if payload.title is not None:
        module.title = payload.title
    if payload.level is not None:
        module.level = payload.level
        
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


# ─────────────────────────────────────────────────────────────────────────────
#  Adaptive Enrollment Flow
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/{course_id}/enroll", response_model=EnrollResponse)
async def enroll_in_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student")),
):
    """
    Student enrolls in a course.
    Creates an Enrollment record with learning_path='pending'.
    The student must then complete the pre-assessment before the path is set.
    """
    course = db.query(Course).filter(
        Course.id == course_id,
        Course.tenant_id == current_user.tenant_id,
        Course.is_published == True,
    ).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found or not published")

    # Idempotent: don't double-enroll
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course_id,
    ).first()
    if existing:
        return EnrollResponse(
            enrollment_id=existing.id,
            course_id=course_id,
            student_id=current_user.id,
            learning_path=existing.learning_path,
            message="Already enrolled",
        )

    enrollment = Enrollment(
        student_id=current_user.id,
        course_id=course_id,
        learning_path="pending",
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    return EnrollResponse(
        enrollment_id=enrollment.id,
        course_id=course_id,
        student_id=current_user.id,
        learning_path="pending",
        message="Enrolled successfully. Complete the placement assessment to unlock your path.",
    )


@router.get("/{course_id}/enrollment-status", response_model=EnrollmentStatusResponse)
async def get_enrollment_status(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns whether the current student is enrolled and their learning path status."""
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course_id,
    ).first()

    if not enrollment:
        return EnrollmentStatusResponse(is_enrolled=False)

    return EnrollmentStatusResponse(
        is_enrolled=True,
        enrollment_id=enrollment.id,
        learning_path=enrollment.learning_path,
        placement_score=enrollment.placement_score,
        path_override=enrollment.path_override,
        progress_percentage=enrollment.progress_percentage,
    )


@router.post("/{course_id}/placement-result", response_model=PlacementResultResponse)
async def submit_placement_result(
    course_id: int,
    payload: PlacementResultRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("student")),
):
    """
    Student submits their pre-assessment score.
    The system recommends a learning path based on score bands:
      - 0–39  → basics
      - 40–69 → intermediate
      - 70+   → advanced

    If `override_to_basics` is True, the student chose to start from the beginning
    regardless of their assessed level.
    """
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course_id,
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled in this course")

    score = max(0.0, min(100.0, payload.score))

    # Determine recommended path from score
    if score < 40:
        recommended = "basics"
    elif score < 70:
        recommended = "intermediate"
    else:
        recommended = "advanced"

    # Assigned path respects student's override choice
    assigned = "basics" if payload.override_to_basics else recommended

    # Path messages
    path_messages = {
        "basics": "Great start! We'll build your foundation step by step from the ground up.",
        "intermediate": "Solid base! You'll skip the fundamentals and dive straight into core concepts.",
        "advanced": "Impressive! You've unlocked the advanced track — challenge yourself with complex material.",
    }

    enrollment.placement_score = score
    enrollment.learning_path = assigned
    enrollment.path_override = payload.override_to_basics
    db.commit()

    return PlacementResultResponse(
        recommended_path=recommended,
        assigned_path=assigned,
        score=score,
        message=path_messages[assigned],
    )


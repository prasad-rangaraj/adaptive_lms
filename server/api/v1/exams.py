from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from db.database import get_db
from models.user import User
from models.exam import Exam, ExamQuestion, ExamAttempt
from models.course import Course
from models.enrollment import Enrollment
from models.academic import Department, Cohort
from core.security import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/exams", tags=["exams"])

class QuestionCreate(BaseModel):
    text: str
    type: str = "mcq"
    options: List[Dict[str, str]] = []
    correct_answer: str = ""
    marks: float = 1.0

class ExamCreate(BaseModel):
    title: str
    duration_minutes: int
    total_marks: float
    course_id: int = 1  # Default for demo
    is_published: bool = True
    questions: List[QuestionCreate]

@router.post("")
def create_exam(
    exam_in: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create exams")
        
    # Create Exam
    new_exam = Exam(
        course_id=exam_in.course_id,
        title=exam_in.title,
        duration_minutes=exam_in.duration_minutes,
        total_marks=exam_in.total_marks,
        is_published=exam_in.is_published
    )
    db.add(new_exam)
    db.flush()
    
    # Add Questions
    for idx, q in enumerate(exam_in.questions):
        db_q = ExamQuestion(
            exam_id=new_exam.id,
            question_text=q.text,
            question_type=q.type,
            options=q.options,
            correct_answer=q.correct_answer,
            marks=q.marks,
            order_index=idx
        )
        db.add(db_q)
        
    db.commit()
    return {"id": new_exam.id, "message": "Exam published successfully"}

from models.proctor_log import ProctorLog

@router.get("/published")
def get_published_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Return the latest published standard/official exam (exclude weekly tests and question banks)
    exam = db.query(Exam).filter(
        Exam.is_published == True,
        Exam.exam_type.notin_(["weekly_test", "question_bank"]),
        Exam.title != "Global Question Bank",
        Exam.total_marks > 0
    ).order_by(Exam.created_at.desc()).first()
    
    if not exam:
        return None
        
    questions = db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam.id).all()
    
    return {
        "id": exam.id,
        "title": exam.title,
        "duration_minutes": exam.duration_minutes,
        "total_marks": exam.total_marks,
        "questions": [
            {
                "id": q.id,
                "text": q.question_text,
                "type": q.question_type,
                "options": q.options,
                "marks": q.marks
            } for q in questions
        ]
    }

class ExamSubmit(BaseModel):
    answers: Dict[str, Any]
    score: float
    cheat_risk_score: float

@router.post("/{exam_id}/submit")
def submit_exam(
    exam_id: int,
    submission: ExamSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["student", "teacher", "tenant_admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Unauthorized to submit exams")
        
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
        
    total_marks = float(exam.total_marks) if exam.total_marks else 100.0
    percentage = (submission.score / total_marks) * 100.0 if total_marks > 0 else 0.0

    attempt = ExamAttempt(
        exam_id=exam.id,
        student_id=current_user.id,
        answers=submission.answers,
        score=submission.score,
        percentage=percentage,
        status="submitted",
        cheat_risk_score=submission.cheat_risk_score
    )
    db.add(attempt)

    # Ensure a summary proctor log entry exists for this exam session
    session_severity = "low"
    if submission.cheat_risk_score >= 70:
        session_severity = "high"
    elif submission.cheat_risk_score >= 30:
        session_severity = "medium"

    summary_log = ProctorLog(
        exam_id=exam.id,
        user_id=current_user.id,
        violation_type="exam_terminated" if submission.cheat_risk_score >= 100 else "exam_completion",
        severity=session_severity,
        description=f"Exam submitted. Score: {submission.score:.1f}/{total_marks:.1f}. Risk: {submission.cheat_risk_score:.0f}%",
        cumulative_risk_score=submission.cheat_risk_score
    )
    db.add(summary_log)
    db.commit()
    
    return {"message": "Exam submitted successfully", "score": submission.score}


# ── Weekly Assessment Systems (Teacher, Student, Org Admin) ─────────────────
from models.course import Course
from models.enrollment import Enrollment
from typing import Optional

class WeeklyExamCreate(BaseModel):
    course_id: int
    week_number: int = 1
    title: str
    description: Optional[str] = None
    duration_minutes: int = 30
    total_marks: float = 20.0
    passing_marks: float = 10.0
    is_proctored: bool = True
    is_published: bool = True
    questions: List[Dict[str, Any]]

@router.post("/weekly")
def create_weekly_exam(
    exam_in: WeeklyExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["teacher", "tenant_admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Only teachers and admins can create weekly assessments")

    course = db.query(Course).filter(Course.id == exam_in.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    new_exam = Exam(
        course_id=exam_in.course_id,
        title=exam_in.title,
        description=exam_in.description or f"Mandatory Week {exam_in.week_number} Assessment for {course.title}",
        duration_minutes=exam_in.duration_minutes,
        total_marks=exam_in.total_marks,
        passing_marks=exam_in.passing_marks,
        is_proctored=exam_in.is_proctored,
        is_published=exam_in.is_published,
        exam_type="weekly_test",
        week_number=exam_in.week_number
    )
    db.add(new_exam)
    db.flush()

    total_marks_calc = 0.0
    for idx, q in enumerate(exam_in.questions):
        raw_options = q.get("options", [])
        formatted_options = []
        if isinstance(raw_options, list):
            for o_idx, opt in enumerate(raw_options):
                if isinstance(opt, dict):
                    formatted_options.append({
                        "key": opt.get("key", chr(65 + o_idx)),
                        "text": opt.get("text", "")
                    })
                else:
                    formatted_options.append({
                        "key": chr(65 + o_idx),
                        "text": str(opt)
                    })

        q_marks = float(q.get("marks", 1.0))
        total_marks_calc += q_marks

        db_q = ExamQuestion(
            exam_id=new_exam.id,
            question_text=q.get("text") or q.get("question_text", f"Question {idx + 1}"),
            question_type=q.get("type") or q.get("question_type", "mcq"),
            options=formatted_options,
            correct_answer=q.get("correct_answer", "A"),
            marks=q_marks,
            order_index=idx
        )
        db.add(db_q)

    if total_marks_calc > 0:
        new_exam.total_marks = total_marks_calc

    db.commit()
    return {
        "id": new_exam.id,
        "title": new_exam.title,
        "week_number": new_exam.week_number,
        "course_id": new_exam.course_id,
        "message": f"Week {new_exam.week_number} Assessment published successfully"
    }


@router.get("/teacher/weekly")
def get_teacher_weekly_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["teacher", "tenant_admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    course_query = db.query(Course).filter(Course.tenant_id == current_user.tenant_id)
    if current_user.role == "teacher":
        course_query = course_query.filter(Course.teacher_id == current_user.id)
    teacher_courses = course_query.all()
    course_ids = [c.id for c in teacher_courses]
    course_map = {c.id: c.title for c in teacher_courses}

    if not course_ids:
        return []

    exams = db.query(Exam).filter(
        Exam.course_id.in_(course_ids),
        Exam.exam_type == "weekly_test"
    ).order_by(Exam.week_number.asc(), Exam.created_at.desc()).all()

    results = []
    for exam in exams:
        enrolled_count = db.query(Enrollment).filter(
            Enrollment.course_id == exam.course_id
        ).count()

        attempts = db.query(ExamAttempt).filter(ExamAttempt.exam_id == exam.id).all()
        attended_count = len(attempts)
        avg_score = round(sum(a.percentage or 0 for a in attempts) / attended_count, 1) if attended_count > 0 else 0
        flagged_count = sum(1 for a in attempts if (a.cheat_risk_score or 0) > 30)

        results.append({
            "id": exam.id,
            "title": exam.title,
            "course_id": exam.course_id,
            "course_title": course_map.get(exam.course_id, "Course"),
            "week_number": exam.week_number or 1,
            "duration_minutes": exam.duration_minutes,
            "total_marks": exam.total_marks,
            "passing_marks": exam.passing_marks,
            "is_proctored": exam.is_proctored,
            "is_published": exam.is_published,
            "total_enrolled": enrolled_count,
            "attended_count": attended_count,
            "pending_count": max(0, enrolled_count - attended_count),
            "completion_rate": round((attended_count / enrolled_count) * 100, 1) if enrolled_count > 0 else 0,
            "average_score": avg_score,
            "flagged_count": flagged_count,
            "created_at": exam.created_at.isoformat() if exam.created_at else None,
        })
    return results


@router.get("/weekly/{exam_id}/roster")
def get_weekly_exam_roster(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["teacher", "tenant_admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    enrollments = db.query(Enrollment).filter(Enrollment.course_id == exam.course_id).all()
    roster = []
    for enr in enrollments:
        student = enr.student
        if not student:
            continue

        attempt = db.query(ExamAttempt).filter(
            ExamAttempt.exam_id == exam.id,
            ExamAttempt.student_id == student.id
        ).first()

        roster.append({
            "student_id": student.id,
            "student_name": student.full_name or student.username,
            "student_email": student.email,
            "avatar_url": student.avatar_url,
            "status": "attended" if attempt else "pending",
            "score": attempt.score if attempt else None,
            "percentage": attempt.percentage if attempt else None,
            "passed": (attempt.score >= (exam.passing_marks or 0)) if attempt and attempt.score is not None else False,
            "cheat_risk_score": attempt.cheat_risk_score if attempt else 0,
            "submitted_at": attempt.submitted_at.isoformat() if attempt and attempt.submitted_at else None,
        })

    total_enrolled = len(roster)
    attended_count = sum(1 for r in roster if r["status"] == "attended")
    pending_count = max(0, total_enrolled - attended_count)
    completion_rate = round((attended_count / total_enrolled) * 100, 1) if total_enrolled > 0 else 0.0
    attended_scores = [r["percentage"] for r in roster if r["percentage"] is not None]
    avg_score = round(sum(attended_scores) / len(attended_scores), 1) if attended_scores else 0.0

    return {
        "exam_id": exam.id,
        "title": exam.title,
        "course_title": exam.course.title if exam.course else "Course",
        "week_number": exam.week_number or 1,
        "passing_marks": exam.passing_marks,
        "total_marks": exam.total_marks,
        "stats": {
            "total_enrolled": total_enrolled,
            "attended_count": attended_count,
            "pending_count": pending_count,
            "completion_rate": completion_rate,
            "avg_score": avg_score
        },
        "roster": roster
    }


@router.get("/student/weekly")
def get_student_weekly_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enrollments = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id
    ).all()
    enrolled_course_ids = [e.course_id for e in enrollments]

    if not enrolled_course_ids:
        return []

    exams = db.query(Exam).join(Course, Course.id == Exam.course_id).filter(
        Exam.course_id.in_(enrolled_course_ids),
        Exam.exam_type == "weekly_test",
        Exam.is_published == True
    ).order_by(Exam.week_number.asc(), Exam.created_at.desc()).all()

    results = []
    for exam in exams:
        attempt = db.query(ExamAttempt).filter(
            ExamAttempt.exam_id == exam.id,
            ExamAttempt.student_id == current_user.id
        ).first()

        results.append({
            "id": exam.id,
            "title": exam.title,
            "course_id": exam.course_id,
            "course_title": exam.course.title if exam.course else "Course",
            "week_number": exam.week_number or 1,
            "duration_minutes": exam.duration_minutes,
            "total_marks": exam.total_marks,
            "passing_marks": exam.passing_marks,
            "is_proctored": exam.is_proctored,
            "proctoring_enabled": exam.is_proctored,
            "is_mandatory": True,
            "question_count": len(exam.questions) if exam.questions else 0,
            "has_attended": attempt is not None,
            "student_score": attempt.score if attempt else None,
            "percentage": attempt.percentage if attempt else None,
            "attempt": {
                "score": attempt.score,
                "percentage": attempt.percentage,
                "status": attempt.status,
                "cheat_risk_score": attempt.cheat_risk_score,
                "submitted_at": attempt.submitted_at.isoformat() if attempt and attempt.submitted_at else None,
            } if attempt else None,
            "due_date": exam.due_date.isoformat() if exam.due_date else None,
        })
    return results


@router.get("/course/{course_id}/weekly")
def get_course_weekly_exams(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exams = db.query(Exam).filter(
        Exam.course_id == course_id,
        Exam.exam_type == "weekly_test",
        Exam.is_published == True
    ).order_by(Exam.week_number.asc()).all()

    results = []
    for exam in exams:
        attempt = db.query(ExamAttempt).filter(
            ExamAttempt.exam_id == exam.id,
            ExamAttempt.student_id == current_user.id
        ).first()

        results.append({
            "id": exam.id,
            "title": exam.title,
            "course_id": exam.course_id,
            "week_number": exam.week_number or 1,
            "duration_minutes": exam.duration_minutes,
            "total_marks": exam.total_marks,
            "passing_marks": exam.passing_marks,
            "is_proctored": exam.is_proctored,
            "proctoring_enabled": exam.is_proctored,
            "question_count": len(exam.questions) if exam.questions else 0,
            "has_attended": attempt is not None,
            "student_score": attempt.score if attempt else None,
            "percentage": attempt.percentage if attempt else None,
            "attempt": {
                "score": attempt.score,
                "percentage": attempt.percentage,
                "status": attempt.status,
                "submitted_at": attempt.submitted_at.isoformat() if attempt and attempt.submitted_at else None,
            } if attempt else None,
        })
    return results


@router.get("/admin/weekly-monitor")
def get_admin_weekly_monitor(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["tenant_admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    tenant_id = current_user.tenant_id or 1
    all_depts = db.query(Department).filter((Department.tenant_id == tenant_id) | (Department.tenant_id == 1)).all()
    if not all_depts:
        from crud.academic import get_departments as ensure_depts
        all_depts = ensure_depts(db, tenant_id)
    dept_map = {d.id: d for d in all_depts}

    course_query = db.query(Course)
    if current_user.role == "tenant_admin":
        course_query = course_query.filter(Course.tenant_id == current_user.tenant_id)
    courses = course_query.all()
    course_ids = [c.id for c in courses]
    course_map = {c.id: c for c in courses}

    if not course_ids:
        empty_kpis = {"total_weekly_assessments": 0, "total_mandatory_slots": 0, "overall_attended": 0, "overall_pending": 0, "overall_compliance_rate": 0, "overall_avg_score": 0, "total_proctor_flags": 0}
        return {"stats": empty_kpis, "kpis": empty_kpis, "assessments": []}

    exams = db.query(Exam).filter(
        Exam.course_id.in_(course_ids),
        Exam.exam_type == "weekly_test"
    ).order_by(Exam.week_number.asc(), Exam.created_at.desc()).all()

    total_slots = 0
    total_attended = 0
    all_scores = []
    total_flags = 0

    exam_list = []
    for exam in exams:
        c = course_map.get(exam.course_id)
        enrolled_count = db.query(Enrollment).filter(Enrollment.course_id == exam.course_id).count()
        attempts = db.query(ExamAttempt).filter(ExamAttempt.exam_id == exam.id).all()
        attended_count = len(attempts)
        avg_score = round(sum(a.percentage or 0 for a in attempts) / attended_count, 1) if attended_count > 0 else 0
        flagged_count = sum(1 for a in attempts if (a.cheat_risk_score or 0) > 30)

        total_slots += enrolled_count
        total_attended += attended_count
        all_scores.extend([a.percentage for a in attempts if a.percentage is not None])
        total_flags += flagged_count

        # Department & Year mapping
        c_dept_id = c.department_id if c else None
        c_dept_name = "Computer Science & Engineering"
        if c and c.department_id and c.department_id in dept_map:
            c_dept_name = dept_map[c.department_id].name
        elif c and c.category:
            c_dept_name = c.category

        c_year_num = ((c.id - 1) % 4) + 1 if c else 1
        c_year_str = f"Year {c_year_num}"

        exam_list.append({
            "id": exam.id,
            "title": exam.title,
            "course_id": exam.course_id,
            "course_title": c.title if c else "Course",
            "teacher_name": c.teacher.full_name if c and c.teacher else "Instructor",
            "instructor_name": c.teacher.full_name if c and c.teacher else "Instructor",
            "course_code": f"CRS-{c.id:03d}" if c else "CRS",
            "department_id": c_dept_id,
            "department_name": c_dept_name,
            "year": c_year_str,
            "academic_year": c_year_num,
            "teacher_email": c.teacher.email if c and c.teacher else "",
            "week_number": exam.week_number or 1,
            "duration_minutes": exam.duration_minutes,
            "total_marks": exam.total_marks,
            "is_proctored": exam.is_proctored,
            "total_enrolled": enrolled_count,
            "attended_count": attended_count,
            "pending_count": max(0, enrolled_count - attended_count),
            "completion_rate": round((attended_count / enrolled_count) * 100, 1) if enrolled_count > 0 else 0,
            "average_score": avg_score,
            "flagged_count": flagged_count,
            "created_at": exam.created_at.isoformat() if exam.created_at else None,
        })

    kpis = {
        "total_weekly_assessments": len(exam_list),
        "total_mandatory_slots": total_slots,
        "overall_attended": total_attended,
        "overall_pending": max(0, total_slots - total_attended),
        "overall_compliance_rate": round((total_attended / total_slots) * 100, 1) if total_slots > 0 else 0,
        "overall_avg_score": round(sum(all_scores) / len(all_scores), 1) if all_scores else 0,
        "total_proctor_flags": total_flags,
    }

    return {"stats": kpis, "kpis": kpis, "assessments": exam_list}


@router.get("/{exam_id}")
def get_exam_by_id(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
        
    questions = db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam.id).order_by(ExamQuestion.order_index).all()
    
    attempt = db.query(ExamAttempt).filter(
        ExamAttempt.exam_id == exam.id,
        ExamAttempt.student_id == current_user.id
    ).first()

    return {
        "id": exam.id,
        "title": exam.title,
        "description": exam.description,
        "course_id": exam.course_id,
        "course_title": exam.course.title if exam.course else "General",
        "exam_type": exam.exam_type or "weekly_test",
        "week_number": exam.week_number or 1,
        "duration_minutes": exam.duration_minutes,
        "total_marks": exam.total_marks,
        "passing_marks": exam.passing_marks,
        "is_proctored": exam.is_proctored,
        "has_attempted": attempt is not None,
        "attempt_score": attempt.score if attempt else None,
        "attempt_percentage": attempt.percentage if attempt else None,
        "questions": [
            {
                "id": q.id,
                "text": q.question_text,
                "type": q.question_type,
                "options": q.options,
                "marks": q.marks,
                "correct_answer": q.correct_answer if (current_user.role != "student" or attempt is not None) else None
            } for q in questions
        ]
    }

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from db.database import get_db
from models.user import User
from models.exam import Exam, ExamQuestion, ExamAttempt
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

@router.get("/published")
def get_published_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # For demo, return the latest published exam
    exam = db.query(Exam).filter(Exam.is_published == True).order_by(Exam.created_at.desc()).first()
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
    answers: Dict[str, str]
    score: float
    cheat_risk_score: float

@router.post("/{exam_id}/submit")
def submit_exam(
    exam_id: int,
    submission: ExamSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can submit exams")
        
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
        
    attempt = ExamAttempt(
        exam_id=exam.id,
        student_id=current_user.id,
        answers=submission.answers,
        score=submission.score,
        percentage=(submission.score / exam.total_marks) * 100 if exam.total_marks > 0 else 0,
        status="submitted",
        cheat_risk_score=submission.cheat_risk_score
    )
    db.add(attempt)
    db.commit()
    
    return {"message": "Exam submitted successfully", "score": submission.score}

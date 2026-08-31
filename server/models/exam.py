from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, default=60)
    total_marks = Column(Float, default=100.0)
    passing_marks = Column(Float, default=40.0)
    is_proctored = Column(Boolean, default=True)
    difficulty = Column(String(20), default="medium")

    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    is_published = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("Course", back_populates="exams")
    questions = relationship("ExamQuestion", back_populates="exam", cascade="all, delete-orphan")
    attempts = relationship("ExamAttempt", back_populates="exam")
    proctor_logs = relationship("ProctorLog", back_populates="exam")


class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False, index=True)

    question_text = Column(Text, nullable=False)
    question_type = Column(String(30), default="mcq")  # mcq, true_false, short_answer, coding
    options = Column(JSON, nullable=True)  # [{"key": "A", "text": "..."}, ...]
    correct_answer = Column(Text, nullable=True)
    marks = Column(Float, default=1.0)
    difficulty = Column(String(20), default="medium")
    order_index = Column(Integer, default=0)

    # AI generated?
    is_ai_generated = Column(Boolean, default=False)

    exam = relationship("Exam", back_populates="questions")


class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    answers = Column(JSON, nullable=True)  # {question_id: answer}
    score = Column(Float, nullable=True)
    percentage = Column(Float, nullable=True)
    status = Column(String(20), default="in_progress")  # in_progress, submitted, graded
    cheat_risk_score = Column(Float, default=0.0)  # 0-100, from proctoring

    started_at = Column(DateTime(timezone=True), server_default=func.now())
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    exam = relationship("Exam", back_populates="attempts")
    student = relationship("User")

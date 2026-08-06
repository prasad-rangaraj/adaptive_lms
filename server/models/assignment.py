from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    total_marks = Column(Float, default=100.0)
    rubric = Column(JSON, nullable=True)  # AI evaluation criteria
    is_published = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    course = relationship("Course", back_populates="assignments")
    submissions = relationship("AssignmentSubmission", back_populates="assignment")


class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    file_url = Column(Text, nullable=True)  # S3 URL
    ocr_text = Column(Text, nullable=True)  # Extracted text after OCR

    # AI Evaluation Results
    ai_score = Column(Float, nullable=True)
    grammar_score = Column(Float, nullable=True)
    plagiarism_score = Column(Float, nullable=True)  # 0=original, 100=copy
    ai_generated_probability = Column(Float, nullable=True)  # 0-100%
    logic_score = Column(Float, nullable=True)
    feedback_json = Column(JSON, nullable=True)  # Detailed AI feedback

    # Teacher Override
    final_score = Column(Float, nullable=True)
    teacher_feedback = Column(Text, nullable=True)

    status = Column(String(30), default="submitted")  # submitted, processing, evaluated
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    evaluated_at = Column(DateTime(timezone=True), nullable=True)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User")

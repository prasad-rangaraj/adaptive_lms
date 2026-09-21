from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)

    status = Column(String(20), default="active")  # active, completed, dropped
    progress_percentage = Column(Float, default=0.0)
    is_certified = Column(Boolean, default=False)
    certificate_url = Column(String(500), nullable=True)

    # ── Adaptive Learning Path ────────────────────────────────────────────────
    # Set to 'pending' until the placement quiz is completed.
    # After assessment: 'basics', 'intermediate', or 'advanced'
    learning_path = Column(String(20), default="pending")  # pending | basics | intermediate | advanced
    placement_score = Column(Float, nullable=True)           # 0–100 score from pre-assessment
    path_override = Column(Boolean, default=False)           # True if student chose basics over recommendation

    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

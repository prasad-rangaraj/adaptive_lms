from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base


class ProctorLog(Base):
    """
    Stores every proctoring violation event in real-time during an exam.
    Broadcasted via WebSocket to teacher and stored for later review.
    """
    __tablename__ = "proctor_logs"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Violation metadata
    violation_type = Column(String(50), nullable=False)
    # Types: tab_switch, no_face, multiple_faces, eye_off_screen,
    #        phone_detected, clipboard_use, background_noise, screen_resize

    severity = Column(String(20), default="medium")  # low, medium, high, critical
    description = Column(Text, nullable=True)
    screenshot_url = Column(Text, nullable=True)  # S3 URL of the captured screenshot

    # Running risk calculation after each event
    cumulative_risk_score = Column(Float, default=0.0)  # 0-100

    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    exam = relationship("Exam", back_populates="proctor_logs")
    user = relationship("User", back_populates="proctor_logs")

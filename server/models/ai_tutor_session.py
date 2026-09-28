from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from db.database import Base
from sqlalchemy.types import JSON

class AITutorSession(Base):
    __tablename__ = "ai_tutor_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    context = Column(String(255), nullable=True)
    persona = Column(String(50), default="tutor")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    messages = Column(JSON, default=list)
    
    user = relationship("User", backref="ai_tutor_sessions")
    course = relationship("Course")

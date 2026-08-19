from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    subdomain = Column(String(100), unique=True, nullable=False, index=True)
    plan = Column(String(50), default="basic")  # basic, pro, enterprise

    # White-labeling
    logo_url = Column(Text, nullable=True)
    primary_color = Column(String(7), default="#6366F1")  # Hex color
    secondary_color = Column(String(7), default="#8B5CF6")

    # Feature flags (stored as JSON-string)
    features_json = Column(Text, default='{"ai_tutor": true, "proctoring": true, "digital_twin": false}')

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    users = relationship("User", back_populates="tenant")
    courses = relationship("Course", back_populates="tenant")

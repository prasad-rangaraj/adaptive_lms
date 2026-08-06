from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
import enum


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    TENANT_ADMIN = "tenant_admin"
    TEACHER = "teacher"
    STUDENT = "student"
    PARENT = "parent"
    HR = "hr"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)  # Nullable for super_admin

    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default=UserRole.STUDENT)
    avatar_url = Column(String(500), nullable=True)

    # Verification
    is_active = Column(Boolean, default=False)
    is_email_verified = Column(Boolean, default=False)
    email_verify_token = Column(String(255), nullable=True)

    # Tracking
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    cognitive_profile = relationship("CognitiveProfile", back_populates="user", uselist=False)
    enrollments = relationship("Enrollment", back_populates="student")
    proctor_logs = relationship("ProctorLog", back_populates="user")

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    difficulty = Column(String(20), default="beginner")  # beginner, intermediate, advanced
    is_published = Column(Boolean, default=False)
    price = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    tenant = relationship("Tenant", back_populates="courses")
    teacher = relationship("User")
    materials = relationship("CourseMaterial", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course")
    exams = relationship("Exam", back_populates="course")
    assignments = relationship("Assignment", back_populates="course")
    vector_embeddings = relationship("VectorEmbedding", back_populates="course")


class CourseMaterial(Base):
    __tablename__ = "course_materials"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)

    title = Column(String(255), nullable=False)
    material_type = Column(String(20), nullable=False)  # video, pdf, doc, link
    s3_url = Column(Text, nullable=True)
    external_url = Column(Text, nullable=True)
    duration_seconds = Column(Integer, nullable=True)  # For videos
    order_index = Column(Integer, default=0)
    is_processed = Column(Boolean, default=False)  # True after Celery processes embeddings

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("Course", back_populates="materials")
    vector_embeddings = relationship("VectorEmbedding", back_populates="material")

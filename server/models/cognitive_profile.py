from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base


class CognitiveProfile(Base):
    __tablename__ = "cognitive_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Core Scores (0-100)
    focus_score = Column(Float, default=0.0)
    learning_speed = Column(Float, default=0.0)
    retention_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    consistency_score = Column(Float, default=0.0)
    motivation_score = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)  # Dropout risk

    # AI-generated insights (stored as JSON arrays)
    weak_areas = Column(JSON, default=list)      # e.g., ["Calculus", "Thermodynamics"]
    strength_areas = Column(JSON, default=list)  # e.g., ["Python", "Statistics"]
    recommended_style = Column(Text, nullable=True)  # "Visual", "Auditory", "Reading"

    # Adaptive learning track
    learning_track = Column(Text, default="standard")  # "basic", "standard", "advanced"

    last_assessed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="cognitive_profile")

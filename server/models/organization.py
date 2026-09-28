from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base

class TenantAISettings(Base):
    __tablename__ = "tenant_ai_settings"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), unique=True, nullable=False)
    
    # AI Tutor Features
    tutor_active = Column(Boolean, default=True)
    tutor_model = Column(String(50), default="gpt-4o")
    
    # Evaluator Features
    evaluator_active = Column(Boolean, default=True)
    evaluator_model = Column(String(50), default="claude-3-5")
    
    # Generator Features
    generator_active = Column(Boolean, default=False)
    generator_model = Column(String(50), default="gpt-4o")
    
    # Community Features
    community_active = Column(Boolean, default=True)
    community_model = Column(String(50), default="gemini-1-5")
    
    # Privacy & Guardrails
    pii_masking = Column(Boolean, default=True)
    zero_retention = Column(Boolean, default=True)
    strictness_threshold = Column(Integer, default=70) # 0-100 risk tolerance for proctoring/flagging
    
    # Global Persona
    system_prompt = Column(Text, default="Maintain a highly academic, encouraging tone. Never provide direct answers to quiz questions; guide the student using Socratic questioning.")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    tenant = relationship("Tenant")

class BroadcastMessage(Base):
    __tablename__ = "broadcast_messages"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    target_cohort_id = Column(String(100), nullable=True) # None = all students
    sent_by = Column(String(100), nullable=False) # e.g. "Admin"
    reach_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    tenant = relationship("Tenant")

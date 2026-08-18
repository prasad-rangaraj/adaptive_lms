from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    action = Column(String, index=True, nullable=False)
    resource = Column(String, index=True, nullable=False) # e.g., 'tenant', 'user', 'course'
    details = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

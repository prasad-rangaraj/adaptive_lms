from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    # Which org raised the ticket (optional for global admin tickets)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)

    subject = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)   # e.g. 'Billing', 'Auth', 'AI Feature'
    priority = Column(String(20), default="medium")  # low, medium, high, critical
    status = Column(String(30), default="open")      # open, in_progress, resolved, closed

    raised_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    replies_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tenant = relationship("Tenant")
    raised_by_user = relationship("User")

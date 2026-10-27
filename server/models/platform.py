from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base


class PlatformPlanConfig(Base):
    """Stores the latest published subscription plan configuration."""
    __tablename__ = "platform_plan_configs"

    id = Column(Integer, primary_key=True, index=True)
    plans_json = Column(Text, nullable=False)          # JSON array of plan objects
    published_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    version = Column(Integer, default=1)               # increments each publish
    published_at = Column(DateTime(timezone=True), server_default=func.now())

    publisher = relationship("User")


class PlanNotification(Base):
    """One record per tenant per published plan version — tracks read state."""
    __tablename__ = "plan_notifications"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    plan_config_id = Column(Integer, ForeignKey("platform_plan_configs.id"), nullable=False)
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tenant = relationship("Tenant")
    plan_config = relationship("PlatformPlanConfig")


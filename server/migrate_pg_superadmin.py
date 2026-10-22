import traceback
from sqlalchemy import text
from db.database import engine, SessionLocal
from models.system import SupportTicket
from models.tenant import Tenant
from models.audit_log import AuditLog
from models.organization import BroadcastMessage
from models.user import User
from datetime import datetime

def migrate_and_seed():
    print("[MIGRATION] Connecting to PostgreSQL...")
    with engine.connect() as conn:
        # 1. Add description column to support_tickets if not exists
        try:
            conn.execute(text("ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS description TEXT;"))
            conn.commit()
            print("Successfully ensured support_tickets.description exists in PostgreSQL.")
        except Exception as e:
            print(f"Column check notice: {e}")

        # 2. Add replies_count column to support_tickets if not exists
        try:
            conn.execute(text("ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS replies_count INTEGER DEFAULT 0;"))
            conn.commit()
            print("Successfully ensured support_tickets.replies_count exists in PostgreSQL.")
        except Exception as e:
            print(f"Column check notice: {e}")

        # 3. Ensure audit_logs table exists
        try:
            from db.database import Base
            import models.audit_log
            Base.metadata.create_all(bind=engine)
            print("Verified tables created via Base.metadata.create_all")
        except Exception as e:
            print(f"Table verification notice: {e}")

    db = SessionLocal()
    try:
        # Check Super Admin
        sa = db.query(User).filter(User.role == "super_admin").first()
        print(f"Super admin found: {sa.email if sa else 'NONE'}")

        # Ensure Tenant 1 is Enterprise
        t1 = db.query(Tenant).filter(Tenant.id == 1).first()
        if t1:
            t1.plan = "enterprise"
            db.commit()
            print(f"Tenant 1 ({t1.name}) set to plan='enterprise'")

        # Ensure TechGlobal Academy exists
        tg = db.query(Tenant).filter(Tenant.subdomain == "techglobal").first()
        if not tg:
            tg = Tenant(
                name="TechGlobal Academy",
                subdomain="techglobal",
                plan="pro",
                is_active=True,
                primary_color="#0ea5e9",
                secondary_color="#6366f1"
            )
            db.add(tg)
            db.commit()
            print("Created tenant: TechGlobal Academy (pro)")

        # Seed Support Tickets if empty
        ticket_count = db.query(SupportTicket).count()
        print(f"Current support ticket count in PostgreSQL: {ticket_count}")
        if ticket_count == 0:
            tickets = [
                SupportTicket(
                    tenant_id=1,
                    subject="SSO SAML Assertion configuration issue",
                    category="Authentication",
                    priority="high",
                    status="open",
                    raised_by=sa.id if sa else None,
                    replies_count=0,
                    description="Our faculty are receiving an invalid audience URI error when attempting to sign in through Microsoft Entra ID. Could you please check our SAML metadata settings?",
                ),
                SupportTicket(
                    tenant_id=1,
                    subject="Database sync latency spike during peak hours",
                    category="Infrastructure",
                    priority="critical",
                    status="in_progress",
                    raised_by=sa.id if sa else None,
                    replies_count=2,
                    description="Automated alert: Secondary replica sync lag reached 420ms during peak lecture hours today. We require immediate telemetry audit.",
                ),
                SupportTicket(
                    tenant_id=1,
                    subject="Requesting additional AI Tutor token quota",
                    category="Billing",
                    priority="medium",
                    status="resolved",
                    raised_by=sa.id if sa else None,
                    replies_count=3,
                    description="We have consumed 85% of our monthly AI tutor tokens ahead of midterms. Can we provision an extra 250,000 token pack?",
                )
            ]
            db.add_all(tickets)
            db.commit()
            print("Successfully seeded 3 support tickets in PostgreSQL.")

        # Seed Broadcast Messages if empty
        broadcast_count = db.query(BroadcastMessage).count()
        print(f"Current broadcast count in PostgreSQL: {broadcast_count}")
        if broadcast_count == 0:
            b1 = BroadcastMessage(
                tenant_id=1,
                title="Scheduled Platform Maintenance Window",
                message="The platform will undergo scheduled core database upgrades on Sunday at 02:00 UTC. Uptime impact is expected to be under 15 minutes.",
                sent_by="Platform Super Admin",
                reach_count=240
            )
            b2 = BroadcastMessage(
                tenant_id=1,
                title="New AI Proctoring & Cognitive Models Deployed",
                message="Claude 3.5 Sonnet and GPT-4o engine upgrades are now live across all active tenant workspaces.",
                sent_by="Platform Super Admin",
                reach_count=480
            )
            db.add_all([b1, b2])
            db.commit()
            print("Successfully seeded 2 broadcast messages in PostgreSQL.")

        # Seed Audit Logs if empty
        audit_count = db.query(AuditLog).count()
        print(f"Current audit log count in PostgreSQL: {audit_count}")
        if audit_count == 0:
            logs = [
                AuditLog(
                    tenant_id=1,
                    user_id=sa.id if sa else None,
                    action="user_created",
                    resource="user",
                    details={"email": "teacher@demouni.edu", "role": "teacher"},
                    ip_address="192.168.1.104"
                ),
                AuditLog(
                    tenant_id=1,
                    user_id=sa.id if sa else None,
                    action="course_published",
                    resource="course",
                    details={"title": "Full Stack Modern Web Architecture", "course_id": 1},
                    ip_address="192.168.1.104"
                ),
                AuditLog(
                    tenant_id=1,
                    user_id=sa.id if sa else None,
                    action="impersonation_started",
                    resource="security",
                    details={"target_user": "student@demouni.edu", "reason": "Support troubleshooting"},
                    ip_address="10.0.0.12"
                ),
                AuditLog(
                    tenant_id=1,
                    user_id=sa.id if sa else None,
                    action="tenant_suspended",
                    resource="tenant",
                    details={"tenant": "Suspended Test Org", "reason": "Delinquent payment"},
                    ip_address="127.0.0.1"
                ),
            ]
            db.add_all(logs)
            db.commit()
            print("Successfully seeded 4 audit logs in PostgreSQL.")

    except Exception as e:
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_and_seed()

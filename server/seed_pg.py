from db.database import SessionLocal, engine
from sqlalchemy import text
from models.user import User
from models.tenant import Tenant
from models.system import SupportTicket
from models.organization import BroadcastMessage
from models.audit_log import AuditLog
from datetime import datetime

def seed_postgres():
    print("[POSTGRES SEEDING] Initializing...")
    db = SessionLocal()
    try:
        # 1. Update Demo University plan to enterprise
        t1 = db.query(Tenant).filter(Tenant.id == 1).first()
        if t1:
            t1.plan = "enterprise"
            print("Updated Demo University to plan='enterprise'")

        # 2. Add TechGlobal Academy
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
            print("Added TechGlobal Academy (pro)")

        db.commit()

        # 3. Seed Support Tickets
        if db.query(SupportTicket).count() == 0:
            tickets = [
                SupportTicket(
                    tenant_id=1,
                    subject="SSO SAML Assertion configuration issue",
                    category="Authentication",
                    priority="high",
                    status="open",
                    raised_by=2,
                    replies_count=0,
                    description="Our faculty are receiving an invalid audience URI error when attempting to sign in through Microsoft Entra ID. Could you please check our SAML metadata settings?",
                ),
                SupportTicket(
                    tenant_id=1,
                    subject="Database sync latency spike during peak hours",
                    category="Infrastructure",
                    priority="critical",
                    status="in_progress",
                    raised_by=2,
                    replies_count=2,
                    description="Automated alert: Secondary replica sync lag reached 420ms during peak lecture hours today. We require immediate telemetry audit.",
                ),
                SupportTicket(
                    tenant_id=1,
                    subject="Requesting additional AI Tutor token quota",
                    category="Billing",
                    priority="medium",
                    status="resolved",
                    raised_by=2,
                    replies_count=3,
                    description="We have consumed 85% of our monthly AI tutor tokens ahead of midterms. Can we provision an extra 250,000 token pack?",
                )
            ]
            db.add_all(tickets)
            print("Seeded 3 support tickets")

        # 4. Seed Broadcasts
        if db.query(BroadcastMessage).count() == 0:
            broadcasts = [
                BroadcastMessage(
                    tenant_id=1,
                    title="Scheduled Platform Maintenance Window",
                    message="The platform will undergo scheduled core database upgrades on Sunday at 02:00 UTC. Uptime impact is expected to be under 15 minutes.",
                    sent_by="Platform Super Admin",
                    reach_count=240
                ),
                BroadcastMessage(
                    tenant_id=1,
                    title="New AI Proctoring & Cognitive Models Deployed",
                    message="Claude 3.5 Sonnet and GPT-4o engine upgrades are now live across all active tenant workspaces.",
                    sent_by="Platform Super Admin",
                    reach_count=480
                )
            ]
            db.add_all(broadcasts)
            print("Seeded 2 broadcasts")

        # 5. Ensure audit_logs table exists and seed
        with engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id SERIAL PRIMARY KEY,
                    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
                    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    action VARCHAR NOT NULL,
                    resource VARCHAR NOT NULL,
                    details JSON,
                    ip_address VARCHAR,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            conn.commit()

        if db.query(AuditLog).count() == 0:
            logs = [
                AuditLog(
                    tenant_id=1,
                    user_id=2,
                    action="user_created",
                    resource="user",
                    details={"email": "teacher@demouni.edu", "role": "teacher"},
                    ip_address="192.168.1.104"
                ),
                AuditLog(
                    tenant_id=1,
                    user_id=2,
                    action="course_published",
                    resource="course",
                    details={"title": "Full Stack Modern Web Architecture", "course_id": 1},
                    ip_address="192.168.1.104"
                ),
                AuditLog(
                    tenant_id=1,
                    user_id=2,
                    action="impersonation_started",
                    resource="security",
                    details={"target_user": "student@demouni.edu", "reason": "Support troubleshooting"},
                    ip_address="10.0.0.12"
                ),
                AuditLog(
                    tenant_id=1,
                    user_id=2,
                    action="tenant_suspended",
                    resource="tenant",
                    details={"tenant": "Suspended Test Org", "reason": "Delinquent payment"},
                    ip_address="127.0.0.1"
                ),
            ]
            db.add_all(logs)
            print("Seeded 4 audit logs")

        db.commit()
        print("[POSTGRES SEEDING] Complete!")
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_postgres()

import asyncio
from db.database import SessionLocal, engine, Base
from models.user import User
from models.tenant import Tenant
from models.cognitive_profile import CognitiveProfile
from core.security import get_password_hash
import secrets

def seed_database():
    print("Starting database seeding...")
    db = SessionLocal()
    try:
        # Create Super Admin if not exists
        super_admin_email = "superadmin@lms.com"
        super_admin = db.query(User).filter(User.email == super_admin_email).first()
        if not super_admin:
            super_admin = User(
                email=super_admin_email,
                full_name="Global Super Admin",
                password_hash=get_password_hash("password123"),
                role="super_admin",
                is_active=True,
                is_email_verified=True,
            )
            db.add(super_admin)
            print("Created Super Admin: superadmin@lms.com / password123")
        else:
            print("Super Admin already exists.")

        # Create Demo Tenant
        tenant_subdomain = "demo-uni"
        tenant = db.query(Tenant).filter(Tenant.subdomain == tenant_subdomain).first()
        if not tenant:
            tenant = Tenant(
                name="Demo University",
                subdomain=tenant_subdomain,
                plan="premium",
                is_active=True,
            )
            db.add(tenant)
            db.flush()
            print("Created Tenant: Demo University (demo-uni)")
        else:
            print("Demo Tenant already exists.")
            
        tenant_id = tenant.id

        # Create Org Admin
        org_admin_email = "admin@demouni.edu"
        org_admin = db.query(User).filter(User.email == org_admin_email).first()
        if not org_admin:
            org_admin = User(
                email=org_admin_email,
                full_name="University Admin",
                password_hash=get_password_hash("password123"),
                role="tenant_admin",
                tenant_id=tenant_id,
                is_active=True,
                is_email_verified=True,
            )
            db.add(org_admin)
            print("Created Org Admin: admin@demouni.edu / password123")
        else:
            print("Org Admin already exists.")

        # Create Teacher
        teacher_email = "teacher@demouni.edu"
        teacher = db.query(User).filter(User.email == teacher_email).first()
        if not teacher:
            teacher = User(
                email=teacher_email,
                full_name="Professor Smith",
                password_hash=get_password_hash("password123"),
                role="teacher",
                tenant_id=tenant_id,
                is_active=True,
                is_email_verified=True,
            )
            db.add(teacher)
            print("Created Teacher: teacher@demouni.edu / password123")
        else:
            print("Teacher already exists.")

        # Create Student
        student_email = "student@demouni.edu"
        student = db.query(User).filter(User.email == student_email).first()
        if not student:
            student = User(
                email=student_email,
                full_name="Alice Learner",
                password_hash=get_password_hash("password123"),
                role="student",
                tenant_id=tenant_id,
                is_active=True,
                is_email_verified=True,
            )
            db.add(student)
            db.flush()
            
            # Create cognitive profile for student
            profile = CognitiveProfile(user_id=student.id)
            db.add(profile)
            
            print("Created Student: student@demouni.edu / password123")
        else:
            print("Student already exists.")

        db.commit()
        print("Database seeding completed successfully.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

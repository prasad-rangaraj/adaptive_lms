import os
import sys

# Add server directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.database import engine, Base
from models.academic import StudentMark, AcademicResource

def migrate():
    print("Creating academic tables...")
    StudentMark.__table__.create(bind=engine, checkfirst=True)
    AcademicResource.__table__.create(bind=engine, checkfirst=True)
    print("Academic tables created successfully.")

if __name__ == "__main__":
    migrate()

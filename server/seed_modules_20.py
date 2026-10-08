import os
import json
import random
from sqlalchemy.orm import Session
from db.database import SessionLocal, engine
from models.course import Course, CourseModule, CourseMaterial

PHASES = [
    ("Fundamentals", "fundamentals", 5),
    ("Beginner Level", "beginner", 5),
    ("Intermediate Level", "intermediate", 5),
    ("Advanced Level", "advanced", 5)
]

def generate_video_url():
    videos = [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        "https://www.youtube.com/watch?v=PkZNo7MFYgS"
    ]
    return random.choice(videos)

def seed_modules():
    db = SessionLocal()
    
    # Delete existing materials and modules
    db.query(CourseMaterial).delete()
    db.query(CourseModule).delete()
    db.commit()
    print("Deleted old modules and materials.")

    courses = db.query(Course).all()
    
    for course in courses:
        print(f"Seeding 20 modules for Course: {course.title}")
        order_index = 0
        
        for phase_name, level, count in PHASES:
            for i in range(count):
                mod_title = f"{phase_name} - Module {i+1}"
                if level == 'fundamentals':
                    desc = f"Fundamental concepts of {course.title} to get you started."
                elif level == 'beginner':
                    desc = f"Beginner topics for {course.title}."
                elif level == 'intermediate':
                    desc = f"Core intermediate concepts for {course.title}."
                else:
                    desc = f"Advanced deep dive into {course.title}."
                
                mod = CourseModule(
                    course_id=course.id,
                    title=mod_title,
                    order_index=order_index,
                    level=level
                )
                db.add(mod)
                db.flush()
                
                mat_vid = CourseMaterial(
                    module_id=mod.id,
                    title=f"Video Lesson: {mod_title}",
                    material_type="youtube",
                    external_url=generate_video_url(),
                    order_index=0
                )
                mat_pdf = CourseMaterial(
                    module_id=mod.id,
                    title=f"Resource PDF: {mod_title}",
                    material_type="pdf",
                    s3_url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    order_index=1
                )
                mat_transcript = CourseMaterial(
                    module_id=mod.id,
                    title=f"Transcript: {mod_title}",
                    material_type="article",
                    s3_url="",
                    order_index=2
                )
                
                db.add_all([mat_vid, mat_pdf, mat_transcript])
                order_index += 1

    db.commit()
    print("Seeding complete! Each course has 20 modules.")

if __name__ == '__main__':
    seed_modules()

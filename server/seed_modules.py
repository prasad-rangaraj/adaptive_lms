import os
import sys

# Ensure the server directory is in the path so we can import from db and models
sys.path.append(r'c:\projects\adaptive_lms\server')

from db.database import SessionLocal
from models.course import Course, CourseModule, CourseMaterial

def run():
    db = SessionLocal()
    courses = db.query(Course).all()
    
    levels = ["fundamentals", "beginner", "intermediate", "advanced"]
    
    concepts_by_level = {
        "fundamentals": ["Introduction", "Basic Syntax", "Data Types", "Variables", "Control Flow"],
        "beginner": ["Functions", "Arrays", "Objects", "Error Handling", "Basic Algorithms"],
        "intermediate": ["Classes", "Asynchronous Programming", "API Integration", "State Management", "Testing"],
        "advanced": ["Architecture", "Performance Optimization", "Security", "Deployment", "Microservices"]
    }

    for course in courses:
        print(f"Processing course: {course.title} (ID: {course.id})")
        # Delete existing materials first
        module_ids = [m.id for m in db.query(CourseModule.id).filter(CourseModule.course_id == course.id).all()]
        if module_ids:
            db.query(CourseMaterial).filter(CourseMaterial.module_id.in_(module_ids)).delete(synchronize_session=False)
        
        # Then delete modules
        db.query(CourseModule).filter(CourseModule.course_id == course.id).delete(synchronize_session=False)
        
        module_index = 1
        
        for level in levels:
            concepts = concepts_by_level[level]
            for i in range(5):
                concept_name = concepts[i] if i < len(concepts) else f"Advanced Concept {i+1}"
                
                module_title = f"Module {module_index}: {concept_name}"
                
                mod = CourseModule(
                    course_id=course.id,
                    title=module_title,
                    order_index=module_index,
                    level=level
                )
                db.add(mod)
                db.flush()
                
                mat = CourseMaterial(
                    module_id=mod.id,
                    title=f"{concept_name} - Study Guide",
                    material_type="pdf",
                    s3_url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    order_index=1
                )
                db.add(mat)
                
                module_index += 1
                
    db.commit()
    print("Database seeding for modules complete!")

if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv()
    run()

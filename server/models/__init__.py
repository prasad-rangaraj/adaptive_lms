from core.database import Base  # noqa: F401

# Import all models so SQLAlchemy can discover them for alembic and Base.metadata.create_all()
from models.tenant import Tenant  # noqa: F401
from models.user import User  # noqa: F401
from models.cognitive_profile import CognitiveProfile  # noqa: F401
from models.course import Course, CourseMaterial  # noqa: F401
from models.vector_embedding import VectorEmbedding  # noqa: F401
from models.exam import Exam, ExamQuestion, ExamAttempt  # noqa: F401
from models.assignment import Assignment, AssignmentSubmission  # noqa: F401
from models.proctor_log import ProctorLog  # noqa: F401
from models.enrollment import Enrollment  # noqa: F401
from models.audit_log import AuditLog  # noqa: F401

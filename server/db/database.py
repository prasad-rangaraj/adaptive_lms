from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from core.config import settings


engine = create_engine(
    "sqlite:///./lms.db",
    pool_pre_ping=True,
    # SQLite does not support pool_size and max_overflow natively like postgres without configuring poolclass
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency to provide a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_extensions():
    """Enable pgvector extension in PostgreSQL on startup."""
    pass

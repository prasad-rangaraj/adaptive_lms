from sqlalchemy import Column, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from db.database import Base


class VectorEmbedding(Base):
    """
    Stores text chunks from course materials as vector embeddings for RAG (AI Tutor).
    Using pgvector extension inside PostgreSQL — no separate vector DB needed.
    """
    __tablename__ = "vector_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False, index=True)
    material_id = Column(Integer, ForeignKey("course_materials.id"), nullable=True)

    # The actual text paragraph/chunk
    text_chunk = Column(Text, nullable=False)

    # OpenAI text-embedding-3-small produces 1536 dimensions
    embedding = Column(Vector(1536), nullable=True)

    chunk_index = Column(Integer, default=0)

    # Relationships
    course = relationship("Course", back_populates="vector_embeddings")
    material = relationship("CourseMaterial", back_populates="vector_embeddings")

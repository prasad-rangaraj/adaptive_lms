from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.config import settings
from db.database import Base, engine, create_extensions

# Import all models to register them with SQLAlchemy
import models  # noqa: F401

# Import all routers
from api.v1 import auth, tenants, courses, ai_tutor, proctoring, assignments, admin, live, cognitive

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    # Startup
    print("[STARTING] Adaptive LMS Backend...")
    create_extensions()           # Enable pgvector in PostgreSQL
    Base.metadata.create_all(bind=engine)  # Create all tables
    print("[DATABASE] Tables created / verified.")
    print(f"[ENVIRONMENT] {settings.ENVIRONMENT}")
    yield
    # Shutdown
    print("[STOPPING] Adaptive LMS Backend...")


app = FastAPI(
    title="Adaptive Multi-Tenant LMS API",
    description="AI-Driven Cognitive Profile Assessment & Automated Proctoring Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth.router)
app.include_router(tenants.router)
app.include_router(courses.router)
app.include_router(ai_tutor.router)
app.include_router(proctoring.router)
app.include_router(assignments.router)
app.include_router(admin.router)
app.include_router(live.router)
app.include_router(cognitive.router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "app": "Adaptive LMS API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}

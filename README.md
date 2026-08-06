# Adaptive Multi-Tenant LMS Ecosystem

> AI-Driven Cognitive Profile Assessment & Automated Proctoring Platform

## Tech Stack
- **Frontend**: React (Vite) + TailwindCSS + Three.js
- **Backend**: FastAPI (Python) + SQLAlchemy
- **Database**: PostgreSQL + pgvector
- **Cache / Queue**: Redis + Celery
- **AI**: OpenAI (GPT-4o + text-embedding-3-small)
- **Infra**: Docker Compose

## Getting Started

### 1. Prerequisites
- Docker Desktop installed and running
- Node.js v18+
- Python 3.11+

### 2. Start Infrastructure
```bash
docker-compose up -d
```

### 3. Start Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## Project Structure
```
adaptive_lms/
├── backend/               # FastAPI application
│   ├── core/              # Config, DB, Security
│   ├── models/            # SQLAlchemy ORM models
│   ├── schemas/           # Pydantic schemas
│   ├── routers/           # API route handlers
│   ├── tasks/             # Celery background tasks
│   └── main.py
├── frontend/              # React + Vite application
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Route-level page components
│       ├── store/         # Zustand global state
│       └── lib/           # API & WebSocket clients
└── docker-compose.yml
```

"""
FastAPI Main Application Entry Point
Initializes routes, middleware, lifespan hooks for model loading, and WebSocket endpoints.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.model_loader import model_registry
from app.api.websocket import router as ws_router
from app.services.translation_service import LANGUAGE_NAMES

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Screen-Based AI Communication Assistant Backend...")
    # Preload ASR models asynchronously
    await model_registry.load_models()
    yield
    logger.info("Shutting down Communication Assistant Backend...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health & Status Endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.VERSION,
        "whisper_ready": model_registry.is_ready(),
        "device": model_registry.device,
        "sample_rate": settings.AUDIO_SAMPLE_RATE
    }

# Languages metadata endpoint
@app.get("/api/languages")
async def get_languages():
    return {
        "languages": [
            {"code": code, "name": name, "is_indian": code in ["hi", "pa", "bn", "ta", "te", "mr", "gu", "ur"]}
            for code, name in LANGUAGE_NAMES.items()
        ]
    }

# Domain vocabularies endpoint
@app.get("/api/domains")
async def get_domains():
    return {
        "domains": [
            {"id": "general", "name": "General Public Counter"},
            {"id": "railway", "name": "Railway & Transport"},
            {"id": "medical", "name": "Healthcare & Clinic"},
            {"id": "public_service", "name": "Government / Civic Desk"}
        ]
    }

# Mount WebSocket endpoint
app.include_router(ws_router)

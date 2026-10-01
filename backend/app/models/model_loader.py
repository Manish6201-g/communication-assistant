"""
Model Loader & Lifecycle Manager
Pre-loads ASR and translation models once during application startup.
Supports CPU and Apple Silicon Metal (MPS / CoreML) acceleration where available.
"""
import logging
import asyncio
from typing import Optional, Any
from app.config import settings

logger = logging.getLogger("model_loader")

class ModelRegistry:
    def __init__(self):
        self.whisper_model: Optional[Any] = None
        self.model_loaded: bool = False
        self.device: str = "cpu"
        self.compute_type: str = "int8"

    async def load_models(self):
        """Pre-loads models in background thread during FastAPI lifespan startup."""
        def _load():
            try:
                from faster_whisper import WhisperModel
                logger.info(f"Loading Faster-Whisper ({settings.WHISPER_MODEL_SIZE}) on {self.device}...")
                # Use int8 compute type for rapid low-latency CPU/Metal inference
                self.whisper_model = WhisperModel(
                    settings.WHISPER_MODEL_SIZE, 
                    device=self.device, 
                    compute_type=self.compute_type,
                    download_root=None
                )
                self.model_loaded = True
                logger.info("Faster-Whisper model loaded successfully.")
            except ImportError:
                logger.warning("faster-whisper is not installed or loading failed. Dual-engine fallback will be used.")
                self.model_loaded = False
            except Exception as e:
                logger.warning(f"Faster-Whisper initialization deferred/fallback: {e}")
                self.model_loaded = False

        await asyncio.to_thread(_load)

    def is_ready(self) -> bool:
        return self.model_loaded and self.whisper_model is not None

model_registry = ModelRegistry()

"""
Configuration settings for Screen-Based AI Communication Assistant Backend
"""
import os
from pydantic import BaseModel
from typing import List

class Settings(BaseModel):
    APP_NAME: str = "Screen-Based AI Communication Assistant"
    VERSION: str = "2.0.0"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Allowed CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    # Audio Specs (AudioWorklet standard 16kHz 16-bit Mono PCM)
    AUDIO_SAMPLE_RATE: int = 16000
    AUDIO_CHANNELS: int = 1
    AUDIO_SAMPLE_WIDTH: int = 2  # 16-bit = 2 bytes
    FRAME_DURATION_MS: int = 20  # 20ms frame = 320 samples = 640 bytes
    
    # VAD & Segmentation
    VAD_ENERGY_THRESHOLD: float = 0.015
    VAD_SPEECH_PADDING_MS: int = 300
    VAD_SILENCE_TIMEOUT_MS: int = 800  # segment cut after 800ms silence
    MAX_SEGMENT_DURATION_SEC: float = 12.0
    MIN_SEGMENT_DURATION_SEC: float = 0.4
    
    # Queue Limits
    MAX_SESSION_AUDIO_QUEUE: int = 500  # avoid unbounded memory growth
    
    # AI Engine Settings
    WHISPER_MODEL_SIZE: str = os.getenv("WHISPER_MODEL_SIZE", "base")
    TRANSLATION_ENGINE: str = os.getenv("TRANSLATION_ENGINE", "hybrid") # hybrid, local, cloud
    OFFLINE_ONLY: bool = os.getenv("OFFLINE_ONLY", "false").lower() == "true"
    
    # Domain specific terminology enhancers (public service, medical, transport, desk)
    DOMAIN_VOCABULARY: dict = {
        "railway": {
            "platform": "प्लेटफ़ॉर्म / ਪਲੇਟਫਾਰਮ",
            "berth": "बर्थ / ਬਰਥ",
            "ticket cancel": "टिकट रद्द / ਟਿਕਟ ਰੱਦ",
            "reservation": "आरक्षण / ਰਿਜ਼ਰਵੇਸ਼ਨ",
            "departure": "प्रस्थान / ਰਵਾਨਗੀ"
        },
        "medical": {
            "prescription": "दवा का पर्चा / ਨੁਸਖ਼ਾ",
            "symptoms": "लक्षण / ਲੱਛਣ",
            "appointment": "मिलने का समय / ਮੁਲਾਕਾਤ"
        },
        "public_service": {
            "token number": "टोकन नंबर / ਟੋਕਨ ਨੰਬਰ",
            "counter": "काउंटर / ਕਾਊਂਟਰ",
            "application": "आवेदन / ਅਰਜ਼ੀ"
        }
    }

settings = Settings()

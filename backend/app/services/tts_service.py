"""
Text-to-Speech (TTS) Service
Synthesizes speech in Indian native and global languages, returning base64 MP3 audio.
Uses gTTS with in-memory caching for instant replay.
"""
import io
import base64
import time
import logging
from typing import Optional, Tuple
from gtts import gTTS

logger = logging.getLogger("tts_service")

# Language code mapping for gTTS
GTTS_LANG_MAP = {
    "hi": "hi",
    "pa": "pa",
    "en": "en",
    "bn": "bn",
    "ta": "ta",
    "te": "te",
    "mr": "mr",
    "gu": "gu",
    "ur": "ur",
    "es": "es",
    "fr": "fr",
    "de": "de",
    "ja": "ja",
    "ar": "ar"
}

class TTSService:
    def __init__(self):
        self._cache = {}

    def synthesize(self, text: str, language: str) -> Tuple[Optional[str], float]:
        """
        Synthesizes text to speech audio.
        Returns: (base64_audio_str, latency_ms)
        """
        if not text or not text.strip():
            return None, 0.0

        cache_key = f"{language}:{text.strip()}"
        if cache_key in self._cache:
            return self._cache[cache_key], 1.0

        start_time = time.perf_counter()
        lang_code = language.split("-")[0].lower()
        gtts_code = GTTS_LANG_MAP.get(lang_code, "en")

        try:
            # Generate speech using gTTS
            tts = gTTS(text=text, lang=gtts_code, slow=False)
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            
            audio_bytes = fp.read()
            b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
            
            # Cache up to 100 recent items
            if len(self._cache) > 100:
                self._cache.pop(next(iter(self._cache)))
            self._cache[cache_key] = b64_audio

            latency_ms = (time.perf_counter() - start_time) * 1000.0
            return b64_audio, round(latency_ms, 2)
        except Exception as e:
            logger.error(f"TTS synthesis error for '{text}' in {language}: {e}")
            return None, 0.0

tts_service = TTSService()

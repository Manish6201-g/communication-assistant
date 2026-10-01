"""
Backend API and Audio Pipeline Unit Tests
"""
import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.services.audio_processor import audio_processor
from app.services.vad_service import VADSegmenter
from app.services.translation_service import translation_service
from app.schemas.events import StartSessionEvent, TranslationEvent, LatencyBreakdown

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_languages_endpoint():
    response = client.get("/api/languages")
    assert response.status_code == 200
    data = response.json()
    assert "languages" in data
    assert any(lang["code"] == "hi" for lang in data["languages"])
    assert any(lang["code"] == "pa" for lang in data["languages"])

def test_audio_conversion():
    # Generate 16000Hz 1 second sine wave
    duration = 0.5
    sample_rate = 16000
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    orig_signal = 0.5 * np.sin(2 * np.pi * 440 * t).astype(np.float32)
    
    pcm_bytes = audio_processor.float32_to_pcm16(orig_signal)
    assert len(pcm_bytes) == int(sample_rate * duration) * 2
    
    recovered = audio_processor.pcm16_to_float32(pcm_bytes)
    assert len(recovered) == len(orig_signal)
    assert np.max(np.abs(recovered - orig_signal)) < 0.01

def test_vad_silence_detection():
    vad = VADSegmenter(sample_rate=16000, energy_threshold=0.01)
    silence = np.zeros(320, dtype=np.float32)
    is_speech, segment = vad.process_frame(silence)
    assert not is_speech
    assert segment is None

def test_event_serialization():
    start = StartSessionEvent(
        source_language="hi",
        target_language="en",
        speaker_role="person_a"
    )
    json_str = start.model_dump_json()
    assert '"source_language":"hi"' in json_str
    assert '"speaker_role":"person_a"' in json_str

@pytest.mark.asyncio
async def test_translation_service():
    # Test translation of standard greeting
    trans, latency = await translation_service.translate("नमस्ते", source_lang="hi", target_lang="en")
    assert trans != ""
    assert latency >= 0.0

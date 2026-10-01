"""
WebSocket End-to-End Pipeline Integration Test
"""
import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.services.audio_processor import audio_processor

def test_websocket_lifecycle():
    client = TestClient(app)
    with client.websocket_connect("/ws/stream") as websocket:
        # 1. Expect initial ready event
        data = websocket.receive_json()
        assert data["type"] == "ready"
        assert "session_id" in data
        assert data["sample_rate"] == 16000

        # 2. Send start event
        websocket.send_json({
            "type": "start",
            "source_language": "hi",
            "target_language": "en",
            "speaker_role": "person_a"
        })
        status_resp = websocket.receive_json()
        assert status_resp["type"] == "status"
        assert status_resp["state"] == "listening"

        # 3. Send binary audio PCM frame (e.g. 100ms of audio = 1600 samples = 3200 bytes)
        fake_audio = np.zeros(1600, dtype=np.float32)
        pcm_bytes = audio_processor.float32_to_pcm16(fake_audio)
        websocket.send_bytes(pcm_bytes)

        # 4. Send stop event
        websocket.send_json({"type": "stop"})
        stop_resp = websocket.receive_json()
        assert stop_resp["type"] == "status"
        assert stop_resp["state"] == "idle"

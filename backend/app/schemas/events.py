"""
WebSocket Event Protocol Schemas
Defines all event payloads for the bidirectional communication pipeline.
"""
from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# Client to Server Events
class StartSessionEvent(BaseModel):
    type: Literal["start"] = "start"
    source_language: str = Field(default="hi", description="BCP-47 or ISO-639-1 code")
    target_language: str = Field(default="en", description="BCP-47 or ISO-639-1 code")
    audio_format: str = Field(default="pcm_s16le")
    sample_rate: int = Field(default=16000)
    channels: int = Field(default=1)
    speaker_role: str = Field(default="person_a", description="person_a or person_b")
    domain: Optional[str] = Field(default="general")

class StopSessionEvent(BaseModel):
    type: Literal["stop"] = "stop"

class SwitchSpeakerEvent(BaseModel):
    type: Literal["switch_speaker"] = "switch_speaker"
    speaker_role: str = Field(description="person_a or person_b")
    source_language: str
    target_language: str

class UpdateConfigEvent(BaseModel):
    type: Literal["config"] = "config"
    person_a_lang: Optional[str] = None
    person_b_lang: Optional[str] = None
    domain: Optional[str] = None

class ClearHistoryEvent(BaseModel):
    type: Literal["clear"] = "clear"

class RequestTTSEvent(BaseModel):
    type: Literal["tts_request"] = "tts_request"
    text: str
    language: str

# Server to Client Events
class LatencyBreakdown(BaseModel):
    capture_ms: float = 0.0
    vad_ms: float = 0.0
    asr_ms: float = 0.0
    translation_ms: float = 0.0
    total_ms: float = 0.0

class SessionReadyEvent(BaseModel):
    type: Literal["ready"] = "ready"
    session_id: str
    source_language: str
    target_language: str
    speaker_role: str
    sample_rate: int
    message: str = "Connected and ready for audio transmission"

class PartialTranscriptEvent(BaseModel):
    type: Literal["partial_transcript"] = "partial_transcript"
    session_id: str
    segment_id: int
    speaker_role: str
    source_language: str
    source_text: str
    is_final: bool = False

class TranslationEvent(BaseModel):
    type: Literal["translation"] = "translation"
    session_id: str
    segment_id: int
    speaker_role: str
    source_language: str
    target_language: str
    source_text: str
    translated_text: str
    is_final: bool = True
    latency: LatencyBreakdown = Field(default_factory=LatencyBreakdown)
    audio_data_base64: Optional[str] = None  # optional inline TTS audio

class TTSResponseEvent(BaseModel):
    type: Literal["tts_response"] = "tts_response"
    text: str
    language: str
    audio_base64: str
    mime_type: str = "audio/mp3"

class ErrorEvent(BaseModel):
    type: Literal["error"] = "error"
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class StatusEvent(BaseModel):
    type: Literal["status"] = "status"
    state: str  # listening, processing, idle, paused
    speaker_role: Optional[str] = None
    message: Optional[str] = None

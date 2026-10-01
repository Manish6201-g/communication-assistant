"""
Session Manager
Maintains in-memory session states, bounded audio buffers, and speaker configurations.
No persistent raw audio is retained after processing.
"""
import uuid
import time
from typing import Dict, Optional, List
import asyncio
from fastapi import WebSocket
from app.config import settings

class SessionState:
    def __init__(self, session_id: str, websocket: WebSocket):
        self.session_id: str = session_id
        self.websocket: WebSocket = websocket
        self.created_at: float = time.time()
        self.last_active: float = time.time()
        
        # Languages
        self.person_a_lang: str = "hi"
        self.person_b_lang: str = "en"
        self.current_speaker: str = "person_a"
        self.source_language: str = "hi"
        self.target_language: str = "en"
        self.domain: str = "general"
        
        # Sequence and segments
        self.segment_counter: int = 0
        self.is_active: bool = False
        self.is_connected: bool = True
        
        # Bounded audio queue (stores raw bytes of PCM s16le frames)
        self.audio_queue: asyncio.Queue[bytes] = asyncio.Queue(maxsize=settings.MAX_SESSION_AUDIO_QUEUE)
        self.dropped_frames: int = 0
        
        # Active processing task
        self.processing_task: Optional[asyncio.Task] = None

    def update_languages(self, source_lang: Optional[str] = None, target_lang: Optional[str] = None, speaker: Optional[str] = None):
        if speaker:
            self.current_speaker = speaker
        if source_lang:
            self.source_language = source_lang
        if target_lang:
            self.target_language = target_lang
        self.last_active = time.time()

    def next_segment_id(self) -> int:
        self.segment_counter += 1
        return self.segment_counter

    async def push_audio(self, chunk: bytes) -> bool:
        """Push PCM audio chunk to bounded queue. Drops if full to avoid memory leaks."""
        self.last_active = time.time()
        try:
            self.audio_queue.put_nowait(chunk)
            return True
        except asyncio.QueueFull:
            self.dropped_frames += 1
            return False

    async def get_audio_chunk(self, timeout: float = 0.5) -> Optional[bytes]:
        try:
            return await asyncio.wait_for(self.audio_queue.get(), timeout=timeout)
        except (asyncio.TimeoutError, asyncio.CancelledError):
            return None

    def clear_audio_buffer(self):
        while not self.audio_queue.empty():
            try:
                self.audio_queue.get_nowait()
            except Exception:
                break


class SessionManager:
    def __init__(self):
        self._sessions: Dict[str, SessionState] = {}
        self._lock = asyncio.Lock()

    async def create_session(self, websocket: WebSocket) -> SessionState:
        session_id = str(uuid.uuid4())
        session = SessionState(session_id, websocket)
        async with self._lock:
            self._sessions[session_id] = session
        return session

    async def get_session(self, session_id: str) -> Optional[SessionState]:
        async with self._lock:
            return self._sessions.get(session_id)

    async def remove_session(self, session_id: str):
        async with self._lock:
            session = self._sessions.pop(session_id, None)
        if session:
            session.is_connected = False
            session.is_active = False
            if session.processing_task and not session.processing_task.done():
                session.processing_task.cancel()
            session.clear_audio_buffer()

    async def cleanup_stale_sessions(self, max_idle_seconds: float = 3600):
        now = time.time()
        stale_ids = []
        async with self._lock:
            for sid, sess in self._sessions.items():
                if now - sess.last_active > max_idle_seconds:
                    stale_ids.append(sid)
        for sid in stale_ids:
            await self.remove_session(sid)

session_manager = SessionManager()

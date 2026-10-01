"""
WebSocket API Endpoint
Handles persistent bi-directional communication, real-time audio chunk processing,
VAD segmentation, ASR transcription, and translation delivery.
"""
import json
import time
import asyncio
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.session.manager import session_manager, SessionState
from app.services.audio_processor import audio_processor
from app.services.vad_service import VADSegmenter
from app.services.asr_service import asr_service
from app.services.translation_service import translation_service
from app.services.tts_service import tts_service
from app.schemas.events import (
    SessionReadyEvent,
    PartialTranscriptEvent,
    TranslationEvent,
    TTSResponseEvent,
    ErrorEvent,
    StatusEvent,
    LatencyBreakdown
)

logger = logging.getLogger("websocket_api")
router = APIRouter()

async def audio_processing_worker(session: SessionState):
    """
    Dedicated worker loop per session that drains audio chunks,
    applies VAD, performs speech recognition and neural translation.
    """
    vad = VADSegmenter()
    logger.info(f"Started audio worker for session {session.session_id}")

    try:
        while session.is_connected:
            chunk = await session.get_audio_chunk(timeout=0.2)
            if chunk is None:
                continue

            if not session.is_active:
                vad.reset()
                continue

            t_cap_start = time.perf_counter()
            samples = audio_processor.pcm16_to_float32(chunk)
            capture_ms = (time.perf_counter() - t_cap_start) * 1000.0

            # VAD segmentation
            t_vad_start = time.perf_counter()
            is_speech, completed_segment = vad.process_frame(samples)
            vad_ms = (time.perf_counter() - t_vad_start) * 1000.0

            if completed_segment is not None and len(completed_segment) > 0:
                # We have a complete spoken utterance!
                segment_id = session.next_segment_id()
                speaker = session.current_speaker
                source_lang = session.source_language
                target_lang = session.target_language

                # ASR Transcription
                asr_text, detected_lang, asr_ms = await asr_service.transcribe(
                    completed_segment, 
                    language=source_lang
                )

                if asr_text and len(asr_text.strip()) > 0:
                    # Send partial/immediate transcript event
                    await session.websocket.send_text(
                        PartialTranscriptEvent(
                            session_id=session.session_id,
                            segment_id=segment_id,
                            speaker_role=speaker,
                            source_language=source_lang,
                            source_text=asr_text,
                            is_final=False
                        ).model_dump_json()
                    )

                    # Neural Translation
                    trans_text, trans_ms = await translation_service.translate(
                        asr_text, 
                        source_lang=source_lang, 
                        target_lang=target_lang,
                        domain=session.domain
                    )

                    # TTS synthesis for speech replay
                    tts_b64, _ = tts_service.synthesize(trans_text, language=target_lang)

                    total_ms = round(capture_ms + vad_ms + asr_ms + trans_ms, 2)
                    latency = LatencyBreakdown(
                        capture_ms=round(capture_ms, 2),
                        vad_ms=round(vad_ms, 2),
                        asr_ms=round(asr_ms, 2),
                        translation_ms=round(trans_ms, 2),
                        total_ms=total_ms
                    )

                    # Send final translation event
                    event = TranslationEvent(
                        session_id=session.session_id,
                        segment_id=segment_id,
                        speaker_role=speaker,
                        source_language=source_lang,
                        target_language=target_lang,
                        source_text=asr_text,
                        translated_text=trans_text,
                        is_final=True,
                        latency=latency,
                        audio_data_base64=tts_b64
                    )
                    await session.websocket.send_text(event.model_dump_json())

    except asyncio.CancelledError:
        logger.info(f"Worker cancelled for session {session.session_id}")
    except Exception as e:
        logger.error(f"Error in audio processing worker: {e}", exc_info=True)


@router.websocket("/ws/stream")
async def websocket_stream_endpoint(websocket: WebSocket):
    await websocket.accept()
    session = await session_manager.create_session(websocket)
    logger.info(f"New client connected: session {session.session_id}")

    # Launch dedicated background worker
    session.processing_task = asyncio.create_task(audio_processing_worker(session))

    try:
        # Send initial Ready Handshake
        ready_event = SessionReadyEvent(
            session_id=session.session_id,
            source_language=session.source_language,
            target_language=session.target_language,
            speaker_role=session.current_speaker,
            sample_rate=16000
        )
        await websocket.send_text(ready_event.model_dump_json())

        while True:
            message = await websocket.receive()
            
            # 1. Binary Audio Frame (16kHz PCM S16LE)
            if "bytes" in message and message["bytes"] is not None:
                audio_bytes = message["bytes"]
                await session.push_audio(audio_bytes)
                continue

            # 2. JSON Control / Configuration Message
            if "text" in message and message["text"] is not None:
                try:
                    payload = json.loads(message["text"])
                    event_type = payload.get("type", "")

                    if event_type == "start":
                        session.is_active = True
                        session.source_language = payload.get("source_language", session.source_language)
                        session.target_language = payload.get("target_language", session.target_language)
                        session.current_speaker = payload.get("speaker_role", session.current_speaker)
                        session.domain = payload.get("domain", session.domain)
                        await websocket.send_text(StatusEvent(state="listening", speaker_role=session.current_speaker, message="Started listening").model_dump_json())

                    elif event_type == "stop":
                        session.is_active = False
                        session.clear_audio_buffer()
                        await websocket.send_text(StatusEvent(state="idle", message="Stopped listening").model_dump_json())

                    elif event_type == "switch_speaker":
                        session.current_speaker = payload.get("speaker_role", session.current_speaker)
                        session.source_language = payload.get("source_language", session.source_language)
                        session.target_language = payload.get("target_language", session.target_language)
                        await websocket.send_text(StatusEvent(state="listening" if session.is_active else "idle", speaker_role=session.current_speaker).model_dump_json())

                    elif event_type == "config":
                        if "person_a_lang" in payload:
                            session.person_a_lang = payload["person_a_lang"]
                        if "person_b_lang" in payload:
                            session.person_b_lang = payload["person_b_lang"]
                        if "domain" in payload:
                            session.domain = payload["domain"]
                        
                        # Re-sync current speaker languages
                        if session.current_speaker == "person_a":
                            session.source_language = session.person_a_lang
                            session.target_language = session.person_b_lang
                        else:
                            session.source_language = session.person_b_lang
                            session.target_language = session.person_a_lang

                    elif event_type == "translate_text":
                        text = payload.get("text", "").strip()
                        if text:
                            speaker = payload.get("speaker_role", session.current_speaker)
                            source_lang = payload.get("source_language", session.source_language)
                            target_lang = payload.get("target_language", session.target_language)
                            segment_id = session.next_segment_id()
                            
                            trans_text, trans_ms = await translation_service.translate(
                                text,
                                source_lang=source_lang,
                                target_lang=target_lang,
                                domain=session.domain
                            )
                            tts_b64, _ = tts_service.synthesize(trans_text, language=target_lang)
                            latency = LatencyBreakdown(
                                capture_ms=0.0,
                                vad_ms=0.0,
                                asr_ms=0.0,
                                translation_ms=round(trans_ms, 2),
                                total_ms=round(trans_ms, 2)
                            )
                            event = TranslationEvent(
                                session_id=session.session_id,
                                segment_id=segment_id,
                                speaker_role=speaker,
                                source_language=source_lang,
                                target_language=target_lang,
                                source_text=text,
                                translated_text=trans_text,
                                is_final=True,
                                latency=latency,
                                audio_data_base64=tts_b64
                            )
                            await websocket.send_text(event.model_dump_json())

                    elif event_type == "tts_request":
                        text = payload.get("text", "")
                        lang = payload.get("language", "en")
                        b64_audio, _ = tts_service.synthesize(text, lang)
                        if b64_audio:
                            await websocket.send_text(TTSResponseEvent(
                                text=text,
                                language=lang,
                                audio_base64=b64_audio
                            ).model_dump_json())

                    elif event_type == "clear":
                        session.clear_audio_buffer()
                        session.segment_counter = 0

                except json.JSONDecodeError:
                    await websocket.send_text(ErrorEvent(code="MALFORMED_JSON", message="Invalid JSON message received").model_dump_json())

    except WebSocketDisconnect:
        logger.info(f"Client disconnected: session {session.session_id}")
    except Exception as e:
        logger.error(f"WebSocket unexpected error for {session.session_id}: {e}", exc_info=True)
    finally:
        session.is_connected = False
        await session_manager.remove_session(session.session_id)

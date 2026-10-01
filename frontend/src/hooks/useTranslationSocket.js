/**
 * useTranslationSocket Hook
 * Manages WebSocket communication, message state, speaker assignment, and latency tracking.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { wsService } from '../services/websocket';

export function useTranslationSocket({ personALang, personBLang, domain }) {
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [activeSpeaker, setActiveSpeaker] = useState('person_a');
  const [messages, setMessages] = useState([]);
  const [partialTranscript, setPartialTranscript] = useState(null);
  const [latestLatency, setLatestLatency] = useState({
    capture_ms: 0,
    vad_ms: 0,
    asr_ms: 0,
    translation_ms: 0,
    total_ms: 0
  });
  const [backendReady, setBackendReady] = useState(false);
  const currentAudioElementRef = useRef(null);

  // Initialize and bind callbacks
  useEffect(() => {
    setConnectionStatus('connecting');

    wsService.callbacks.onOpen = () => {
      setConnectionStatus('connected');
    };

    wsService.callbacks.onClose = () => {
      setConnectionStatus('disconnected');
      setBackendReady(false);
    };

    wsService.callbacks.onReady = (data) => {
      setBackendReady(true);
      console.log('Session ready:', data);
    };

    wsService.callbacks.onPartialTranscript = (data) => {
      setPartialTranscript({
        segment_id: data.segment_id,
        speaker_role: data.speaker_role,
        source_text: data.source_text
      });
    };

    wsService.callbacks.onTranslation = (data) => {
      setPartialTranscript(null);
      const newMsg = {
        id: `${data.session_id}-${data.segment_id}-${Date.now()}`,
        segment_id: data.segment_id,
        speaker_role: data.speaker_role,
        source_language: data.source_language,
        target_language: data.target_language,
        source_text: data.source_text,
        translated_text: data.translated_text,
        latency: data.latency,
        audio_data_base64: data.audio_data_base64,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setMessages((prev) => [...prev.slice(-49), newMsg]); // Bounded history (last 50)
      if (data.latency) {
        setLatestLatency(data.latency);
      }

      // Auto-play TTS audio if available
      if (data.audio_data_base64) {
        playBase64Audio(data.audio_data_base64);
      }
    };

    wsService.callbacks.onTTSResponse = (data) => {
      if (data.audio_base64) {
        playBase64Audio(data.audio_base64);
      }
    };

    wsService.callbacks.onError = (err) => {
      console.error('Socket error event:', err);
      setConnectionStatus('error');
    };

    wsService.connect();

    return () => {
      wsService.disconnect();
    };
  }, []);

  // Update backend config when languages or domain change
  useEffect(() => {
    if (connectionStatus === 'connected') {
      wsService.sendJson({
        type: 'config',
        person_a_lang: personALang,
        person_b_lang: personBLang,
        domain: domain
      });
    }
  }, [personALang, personBLang, domain, connectionStatus]);

  const sendAudioChunk = useCallback((arrayBuffer) => {
    wsService.sendAudioChunk(arrayBuffer);
  }, []);

  const startListening = useCallback((speaker = activeSpeaker) => {
    setActiveSpeaker(speaker);
    const src = speaker === 'person_a' ? personALang : personBLang;
    const tgt = speaker === 'person_a' ? personBLang : personALang;

    wsService.sendJson({
      type: 'start',
      source_language: src,
      target_language: tgt,
      speaker_role: speaker,
      domain: domain
    });
  }, [activeSpeaker, personALang, personBLang, domain]);

  const stopListening = useCallback(() => {
    wsService.sendJson({
      type: 'stop'
    });
    setPartialTranscript(null);
  }, []);

  const switchSpeaker = useCallback((speaker) => {
    setActiveSpeaker(speaker);
    const src = speaker === 'person_a' ? personALang : personBLang;
    const tgt = speaker === 'person_a' ? personBLang : personALang;

    wsService.sendJson({
      type: 'switch_speaker',
      speaker_role: speaker,
      source_language: src,
      target_language: tgt
    });
    setPartialTranscript(null);
  }, [personALang, personBLang]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setPartialTranscript(null);
    wsService.sendJson({ type: 'clear' });
  }, []);

  const playBase64Audio = useCallback((base64Data) => {
    try {
      if (currentAudioElementRef.current) {
        currentAudioElementRef.current.pause();
      }
      const audio = new Audio(`data:audio/mp3;base64,${base64Data}`);
      currentAudioElementRef.current = audio;
      audio.play().catch((e) => console.warn('Audio auto-play prevented:', e));
    } catch (e) {
      console.error('Failed to play base64 audio:', e);
    }
  }, []);

  const replayMessageAudio = useCallback((msg) => {
    if (msg.audio_data_base64) {
      playBase64Audio(msg.audio_data_base64);
    } else {
      // Request fresh TTS from backend
      wsService.sendJson({
        type: 'tts_request',
        text: msg.translated_text,
        language: msg.target_language
      });
    }
  }, [playBase64Audio]);

  return {
    connectionStatus,
    activeSpeaker,
    messages,
    partialTranscript,
    latestLatency,
    sendAudioChunk,
    startListening,
    stopListening,
    switchSpeaker,
    clearConversation,
    replayMessageAudio
  };
}

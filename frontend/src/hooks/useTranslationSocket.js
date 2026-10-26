/**
 * useTranslationSocket Hook
 * Hybrid Architecture:
 * 1. Persistent WebSocket to FastAPI Faster-Whisper backend when available.
 * 2. Multi-tier Neural Machine Translation (GNMT/MyMemory/NMT Cache) & Web Speech API
 *    when standalone, deployed (Vercel/Netlify/GitHub Pages), or offline.
 * Project: AI Translator — Real-Time Multilingual Communication Assistant
 * CGC University Mohali - Department of AI & Data Science
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { wsService } from '../services/websocket';
import { clientTranslationService } from '../services/clientTranslationService';

export function useTranslationSocket({ personALang, personBLang, domain }) {
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [activeSpeaker, setActiveSpeaker] = useState('person_a');
  
  // Seed demonstration conversation matching CGC AI Project Expected Outcomes
  const [messages, setMessages] = useState([
    {
      id: 'demo-1',
      segment_id: 1,
      speaker_role: 'person_a',
      source_language: 'en',
      target_language: 'hi',
      source_text: 'Hello! Can you guide me to the AI and Data Science lab?',
      translated_text: 'नमस्ते! क्या आप मुझे एआई और डेटा साइंस लैब तक ले जा सकते हैं?',
      latency: { capture_ms: 10, vad_ms: 15, asr_ms: 60, translation_ms: 95, total_ms: 180 },
      timestamp: '10:42 AM'
    },
    {
      id: 'demo-2',
      segment_id: 2,
      speaker_role: 'person_b',
      source_language: 'hi',
      target_language: 'en',
      source_text: 'हाँ बिल्कुल, सीधा जाइए और दूसरी मंजिल पर कमरा 204 है।',
      translated_text: 'Yes absolutely, go straight and room 204 is on the second floor.',
      latency: { capture_ms: 12, vad_ms: 14, asr_ms: 55, translation_ms: 88, total_ms: 169 },
      timestamp: '10:43 AM'
    }
  ]);

  const [partialTranscript, setPartialTranscript] = useState(null);
  const [latestLatency, setLatestLatency] = useState({
    capture_ms: 10,
    vad_ms: 15,
    asr_ms: 60,
    translation_ms: 95,
    total_ms: 180
  });
  const [backendReady, setBackendReady] = useState(false);
  const currentAudioElementRef = useRef(null);

  // Initialize and bind WebSocket callbacks
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

      setMessages((prev) => [...prev.slice(-49), newMsg]);
      if (data.latency) {
        setLatestLatency(data.latency);
      }

      // Play audio if available, else fallback to client TTS
      if (data.audio_data_base64) {
        playBase64Audio(data.audio_data_base64);
      } else {
        clientTranslationService.speak(data.translated_text, data.target_language);
      }
    };

    wsService.callbacks.onTTSResponse = (data) => {
      if (data.audio_base64) {
        playBase64Audio(data.audio_base64);
      }
    };

    wsService.callbacks.onError = (err) => {
      console.info('Backend WebSocket offline — switching to high-accuracy Client NMT mode');
      setConnectionStatus('disconnected');
    };

    wsService.connect();

    return () => {
      wsService.disconnect();
    };
  }, []);

  // Sync backend config if connected
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
    if (connectionStatus === 'connected') {
      wsService.sendAudioChunk(arrayBuffer);
    }
  }, [connectionStatus]);

  const startListening = useCallback((speaker = activeSpeaker) => {
    setActiveSpeaker(speaker);
    const src = speaker === 'person_a' ? personALang : personBLang;
    const tgt = speaker === 'person_a' ? personBLang : personALang;

    if (connectionStatus === 'connected') {
      wsService.sendJson({
        type: 'start',
        source_language: src,
        target_language: tgt,
        speaker_role: speaker,
        domain: domain
      });
    }
  }, [activeSpeaker, personALang, personBLang, domain, connectionStatus]);

  const stopListening = useCallback(() => {
    if (connectionStatus === 'connected') {
      wsService.sendJson({
        type: 'stop'
      });
    }
    setPartialTranscript(null);
  }, [connectionStatus]);

  const switchSpeaker = useCallback((speaker) => {
    setActiveSpeaker(speaker);
    const src = speaker === 'person_a' ? personALang : personBLang;
    const tgt = speaker === 'person_a' ? personBLang : personALang;

    if (connectionStatus === 'connected') {
      wsService.sendJson({
        type: 'switch_speaker',
        speaker_role: speaker,
        source_language: src,
        target_language: tgt
      });
    }
    setPartialTranscript(null);
  }, [personALang, personBLang, connectionStatus]);

  const sendDirectText = useCallback(async (text, speaker = activeSpeaker) => {
    if (!text || !text.trim()) return;
    const src = speaker === 'person_a' ? personALang : personBLang;
    const tgt = speaker === 'person_a' ? personBLang : personALang;

    if (connectionStatus === 'connected') {
      wsService.sendJson({
        type: 'translate_text',
        text: text.trim(),
        speaker_role: speaker,
        source_language: src,
        target_language: tgt
      });
    } else {
      // Direct high-accuracy Client NMT (Google Neural NMT / MyMemory / NMT Cache)
      try {
        const result = await clientTranslationService.translate(text.trim(), src, tgt);
        const newMsg = {
          id: `client-${Date.now()}`,
          segment_id: Date.now(),
          speaker_role: speaker,
          source_language: src,
          target_language: tgt,
          source_text: text.trim(),
          translated_text: result.translatedText,
          latency: {
            capture_ms: 0,
            vad_ms: 0,
            asr_ms: 0,
            translation_ms: result.latencyMs,
            total_ms: result.latencyMs
          },
          provider: result.provider,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setMessages((prev) => [...prev.slice(-49), newMsg]);
        setLatestLatency(newMsg.latency);
        clientTranslationService.playFeedbackTone('translated');
        clientTranslationService.speak(result.translatedText, tgt);
      } catch (err) {
        console.error('Client NMT translation error:', err);
      }
    }
  }, [activeSpeaker, personALang, personBLang, connectionStatus]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setPartialTranscript(null);
    if (connectionStatus === 'connected') {
      wsService.sendJson({ type: 'clear' });
    }
    clientTranslationService.playFeedbackTone('click');
  }, [connectionStatus]);

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
      // Replay using client TTS engine
      clientTranslationService.speak(msg.translated_text, msg.target_language);
    }
  }, [playBase64Audio]);

  return {
    connectionStatus,
    activeSpeaker,
    messages,
    partialTranscript,
    setPartialTranscript,
    latestLatency,
    sendAudioChunk,
    startListening,
    stopListening,
    switchSpeaker,
    sendDirectText,
    clearConversation,
    replayMessageAudio
  };
}

import React, { useState, useCallback } from 'react';
import { Radio, ShieldCheck, HelpCircle } from 'lucide-react';
import ConnectionStatus from '../components/ConnectionStatus';
import LatencyIndicator from '../components/LatencyIndicator';
import LanguageSelector from '../components/LanguageSelector';
import AudioControls from '../components/AudioControls';
import TranscriptPanel from '../components/TranscriptPanel';
import { useTranslationSocket } from '../hooks/useTranslationSocket';
import { useAudioCapture } from '../hooks/useAudioCapture';

export default function Translator() {
  const [personALang, setPersonALang] = useState('hi'); // Default Hindi (Native)
  const [personBLang, setPersonBLang] = useState('en'); // Default English
  const [domain, setDomain] = useState('general');
  const [isMirrored, setIsMirrored] = useState(false);

  // Initialize Translation WebSocket Hook
  const {
    connectionStatus,
    activeSpeaker,
    messages,
    partialTranscript,
    latestLatency,
    sendAudioChunk,
    startListening: startListeningSocket,
    stopListening: stopListeningSocket,
    switchSpeaker,
    clearConversation,
    replayMessageAudio
  } = useTranslationSocket({ personALang, personBLang, domain });

  // Initialize Web Audio Microphone Capture Hook (16kHz PCM downsampler)
  const handleAudioChunk = useCallback((arrayBuffer) => {
    sendAudioChunk(arrayBuffer);
  }, [sendAudioChunk]);

  const {
    isCapturing,
    audioLevel,
    error: audioError,
    startCapture,
    stopCapture
  } = useAudioCapture({ onAudioChunk: handleAudioChunk });

  const handleStartListening = async () => {
    await startCapture();
    startListeningSocket(activeSpeaker);
  };

  const handleStopListening = () => {
    stopCapture();
    stopListeningSocket();
  };

  const handleSwitchSpeaker = (role) => {
    switchSpeaker(role);
    if (isCapturing) {
      startListeningSocket(role);
    }
  };

  return (
    <div className="min-h-screen bg-theme-surface flex flex-col justify-between p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl w-full mx-auto space-y-4 md:space-y-6">
        
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-sand/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-theme-terracotta text-white shadow-md">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-theme-dark tracking-tight">
                  Screen-Based AI Communication Assistant
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-theme-cream text-theme-terracotta border border-theme-sand/60">
                  v2.0 Kiosk
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Real-time bidirectional speech translation for counters & interactive kiosks
              </p>
            </div>
          </div>

          <ConnectionStatus
            status={connectionStatus}
            totalLatency={latestLatency.total_ms}
          />
        </header>

        {/* Latency Stage Breakdown Ribbon */}
        <LatencyIndicator latency={latestLatency} />

        {/* Audio Error Banner */}
        {audioError && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 font-semibold flex items-center justify-between">
            <span>Microphone Error: {audioError}</span>
            <button
              onClick={() => handleStartListening()}
              className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700"
            >
              Retry Mic
            </button>
          </div>
        )}

        {/* Language Selection & Domain Configuration */}
        <LanguageSelector
          personALang={personALang}
          setPersonALang={setPersonALang}
          personBLang={personBLang}
          setPersonBLang={setPersonBLang}
          domain={domain}
          setDomain={setDomain}
          disabled={isCapturing}
        />

        {/* Audio Capture Controls & Face-to-Face Mode */}
        <AudioControls
          isListening={isCapturing}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          activeSpeaker={activeSpeaker}
          onSwitchSpeaker={handleSwitchSpeaker}
          audioLevel={audioLevel}
          isMirrored={isMirrored}
          onToggleMirrored={() => setIsMirrored(!isMirrored)}
          onClearConversation={clearConversation}
          disabled={connectionStatus !== 'connected'}
        />

        {/* Dual Equal-Sized Communication Panels */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-stretch">
          {/* Person A Panel */}
          <TranscriptPanel
            role="person_a"
            title="Person A (Counter Operator)"
            languageCode={personALang}
            messages={messages}
            partialTranscript={partialTranscript}
            activeSpeaker={activeSpeaker}
            isMirrored={false}
            onReplayAudio={replayMessageAudio}
          />

          {/* Person B Panel */}
          <TranscriptPanel
            role="person_b"
            title="Person B (Visitor / Citizen)"
            languageCode={personBLang}
            messages={messages}
            partialTranscript={partialTranscript}
            activeSpeaker={activeSpeaker}
            isMirrored={isMirrored}
            onReplayAudio={replayMessageAudio}
          />
        </main>

      </div>

      {/* Footer / Privacy & Privacy-Conscious AI Badge */}
      <footer className="max-w-7xl w-full mx-auto pt-6 pb-2 border-t border-theme-sand/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Privacy Guaranteed: Zero raw audio stored. In-memory real-time processing only.</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Faster-Whisper ASR • gTTS Neural Audio • 16kHz PCM</span>
          <span className="font-semibold text-theme-terracotta">Civic Eye AI</span>
        </div>
      </footer>
    </div>
  );
}

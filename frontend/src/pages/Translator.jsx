import React, { useState, useCallback, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import LanguageBar from '../components/LanguageBar';
import TranscriptView from '../components/TranscriptView';
import ControlDock from '../components/ControlDock';
import DiagnosticsDrawer from '../components/DiagnosticsDrawer';
import QuickPhrasesModal from '../components/QuickPhrasesModal';
import { useTranslationSocket } from '../hooks/useTranslationSocket';
import { useAudioCapture } from '../hooks/useAudioCapture';

export default function Translator() {
  const [personALang, setPersonALang] = useState('hi'); // Default Hindi (Native Indic)
  const [personBLang, setPersonBLang] = useState('en'); // Default English
  const [domain, setDomain] = useState('general');
  const [isMirrored, setIsMirrored] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState('large'); // 'normal', 'large', 'huge'
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);

  // Translation WebSocket hook
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
    sendDirectText,
    clearConversation,
    replayMessageAudio
  } = useTranslationSocket({ personALang, personBLang, domain });

  // Web Audio microphone capture hook (downsamples to 16kHz Mono PCM)
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

  // Start / Stop conversation
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

  // Fullscreen management
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Fullscreen error: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (isCapturing) {
          handleStopListening();
        } else {
          handleStartListening();
        }
      } else if (e.code === 'Tab') {
        e.preventDefault();
        handleSwitchSpeaker(activeSpeaker === 'person_a' ? 'person_b' : 'person_a');
      } else if (e.code === 'KeyF') {
        setIsMirrored((prev) => !prev);
      } else if (e.code === 'KeyD') {
        setShowDiagnostics((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCapturing, activeSpeaker]);

  return (
    <div className="min-h-screen bg-[#080C15] text-slate-100 flex flex-col justify-between p-3 sm:p-5 lg:p-6 pb-28 relative">
      
      {/* Container */}
      <div className="max-w-7xl w-full mx-auto space-y-3.5 sm:space-y-4">
        
        {/* Navigation Header */}
        <Header
          connectionStatus={connectionStatus}
          latestLatency={latestLatency}
          isMirrored={isMirrored}
          onToggleMirrored={() => setIsMirrored(!isMirrored)}
          fontSize={fontSize}
          onChangeFontSize={setFontSize}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onOpenDiagnostics={() => setShowDiagnostics(true)}
          onClearConversation={clearConversation}
        />

        {/* Microphone Error Alert (if permission is denied) */}
        {audioError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs sm:text-sm text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Microphone access issue: {audioError}</span>
            </div>
            <button
              onClick={() => handleStartListening()}
              className="px-3 py-1 bg-rose-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-rose-400 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Language Selection Bar */}
        <LanguageBar
          personALang={personALang}
          setPersonALang={setPersonALang}
          personBLang={personBLang}
          setPersonBLang={setPersonBLang}
          domain={domain}
          setDomain={setDomain}
          disabled={isCapturing}
        />

        {/* Dual Communication Workspace */}
        <main>
          <TranscriptView
            personALang={personALang}
            personBLang={personBLang}
            messages={messages}
            partialTranscript={partialTranscript}
            activeSpeaker={activeSpeaker}
            isListening={isCapturing}
            audioLevel={audioLevel}
            isMirrored={isMirrored}
            fontSize={fontSize}
            onReplayAudio={replayMessageAudio}
          />
        </main>

      </div>

      {/* Floating Ergonomic Control Dock */}
      <ControlDock
        isListening={isCapturing}
        onStartListening={handleStartListening}
        onStopListening={handleStopListening}
        activeSpeaker={activeSpeaker}
        onSwitchSpeaker={handleSwitchSpeaker}
        audioLevel={audioLevel}
        onOpenQuickPhrases={() => setShowQuickPhrases(true)}
        onSendText={sendDirectText}
        disabled={connectionStatus !== 'connected'}
      />

      {/* Slide-Over Diagnostics Drawer */}
      <DiagnosticsDrawer
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
        latency={latestLatency}
        connectionStatus={connectionStatus}
      />

      {/* Quick Phrases Popover */}
      <QuickPhrasesModal
        isOpen={showQuickPhrases}
        onClose={() => setShowQuickPhrases(false)}
        domain={domain}
        activeSpeaker={activeSpeaker}
        onSelectPhrase={sendDirectText}
      />

    </div>
  );
}

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Radio, 
  ShieldCheck, 
  Sparkles, 
  HelpCircle, 
  Volume2, 
  Keyboard, 
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ConnectionStatus from '../components/ConnectionStatus';
import LatencyIndicator from '../components/LatencyIndicator';
import LanguageSelector from '../components/LanguageSelector';
import AudioControls from '../components/AudioControls';
import TranscriptPanel from '../components/TranscriptPanel';
import { useTranslationSocket } from '../hooks/useTranslationSocket';
import { useAudioCapture } from '../hooks/useAudioCapture';

// Domain-specific Quick Phrases
const DOMAIN_QUICK_PHRASES = {
  general: {
    person_a: [
      "Welcome! How may I assist you today?",
      "Please provide your identification document.",
      "Kindly wait for just a moment.",
      "Here is your official receipt.",
      "Thank you, have a wonderful day!"
    ],
    person_b: [
      "Hello, I need some assistance please.",
      "Where should I submit this document?",
      "Could you please explain this to me?",
      "Thank you very much for your help."
    ]
  },
  railway: {
    person_a: [
      "Welcome to Railway Counter. What is your destination?",
      "Platform number 2 is down the escalators on the right.",
      "Your ticket reservation is confirmed.",
      "The train is running on schedule.",
      "Please take your tickets and change."
    ],
    person_b: [
      "I need to cancel my train ticket please.",
      "What time is the departure for Delhi?",
      "Where is platform number 4 located?",
      "Is this ticket confirmed or in waiting list?"
    ]
  },
  medical: {
    person_a: [
      "Please take a seat. What symptoms are you experiencing?",
      "The doctor will examine you shortly.",
      "Here is your prescription for the pharmacy.",
      "Take this medication twice daily after meals."
    ],
    person_b: [
      "I have a fever and chest pain since yesterday.",
      "Where is the medicine dispensary?",
      "Do I need to do any blood tests?",
      "How much is the consultation fee?"
    ]
  },
  public_service: {
    person_a: [
      "Please present your token slip.",
      "Please sign at the bottom of the application form.",
      "Your certificate will be ready in 3 working days.",
      "Your civic request has been registered successfully."
    ],
    person_b: [
      "I have come for certificate verification.",
      "Which documents do I need to attach?",
      "Where is the fee deposit counter located?"
    ]
  }
};

export default function Translator() {
  const [personALang, setPersonALang] = useState('hi'); // Default Hindi (Native indic)
  const [personBLang, setPersonBLang] = useState('en'); // Default English
  const [domain, setDomain] = useState('general');
  const [isMirrored, setIsMirrored] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState('large'); // 'normal', 'large', 'huge'
  const [showShortcuts, setShowShortcuts] = useState(false);

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
    sendDirectText,
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

  // Toggle Kiosk Fullscreen Mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
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
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard Shortcuts (Space to talk, Esc to stop)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
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
      } else if (e.code === 'KeyS') {
        // Switch speaker
        handleSwitchSpeaker(activeSpeaker === 'person_a' ? 'person_b' : 'person_a');
      } else if (e.code === 'KeyF') {
        // Toggle face to face mode
        setIsMirrored((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCapturing, activeSpeaker]);

  const currentDomainPhrases = DOMAIN_QUICK_PHRASES[domain] || DOMAIN_QUICK_PHRASES.general;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7EA] via-[#F9F3CF]/50 to-[#EDE7CF]/70 flex flex-col justify-between p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl w-full mx-auto space-y-4 sm:space-y-6">
        
        {/* Main Kiosk Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-theme-sand/60">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-theme-terracotta text-white shadow-warm ring-4 ring-theme-terracotta/20">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-theme-dark tracking-tight">
                  Civic Eye Communication Assistant
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-theme-cream text-theme-terracotta border border-theme-sand shadow-2xs">
                  Dual Counter Pro
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 font-semibold mt-0.5">
                Real-time speech-to-speech translation for public counters, hospitals & kiosks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              title="Keyboard Shortcuts"
              className="p-2 rounded-2xl bg-theme-surface hover:bg-theme-cream text-stone-600 border border-theme-sand/70 transition shadow-2xs"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            <ConnectionStatus
              status={connectionStatus}
              totalLatency={latestLatency.total_ms}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              fontSize={fontSize}
              onChangeFontSize={setFontSize}
            />
          </div>
        </header>

        {/* Shortcuts Popup Drawer */}
        {showShortcuts && (
          <div className="p-4 bg-theme-card/95 rounded-2xl border border-theme-sand shadow-warm text-xs flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-4 flex-wrap text-stone-700 font-medium">
              <span className="font-bold text-theme-terracotta">⚡ Keyboard Shortcuts:</span>
              <span><kbd className="px-2 py-0.5 rounded bg-theme-cream border font-mono">Space</kbd> Start/Stop Mic</span>
              <span><kbd className="px-2 py-0.5 rounded bg-theme-cream border font-mono">S</kbd> Switch Speaker</span>
              <span><kbd className="px-2 py-0.5 rounded bg-theme-cream border font-mono">F</kbd> Face-to-Face Flip</span>
            </div>
            <button 
              onClick={() => setShowShortcuts(false)}
              className="text-stone-400 hover:text-stone-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Telemetry Stage Latency Ribbon */}
        <LatencyIndicator latency={latestLatency} />

        {/* Microphone Error Alert */}
        {audioError && (
          <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs sm:text-sm text-rose-800 font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>Microphone Access Issue: {audioError}</span>
            </div>
            <button
              onClick={() => handleStartListening()}
              className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition active:scale-95 shadow-2xs"
            >
              Retry Microphone
            </button>
          </div>
        )}

        {/* Language Selection & Domain Deck */}
        <LanguageSelector
          personALang={personALang}
          setPersonALang={setPersonALang}
          personBLang={personBLang}
          setPersonBLang={setPersonBLang}
          domain={domain}
          setDomain={setDomain}
          disabled={isCapturing}
        />

        {/* Tactile Audio Controls Deck */}
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

        {/* Dual Split-Screen Communication Panels */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-stretch">
          {/* Person A Panel (Counter Operator) */}
          <TranscriptPanel
            role="person_a"
            title="Person A (Counter Operator)"
            subTitle="Host Desk"
            languageCode={personALang}
            messages={messages}
            partialTranscript={partialTranscript}
            activeSpeaker={activeSpeaker}
            isListening={isCapturing}
            audioLevel={audioLevel}
            isMirrored={false}
            fontSize={fontSize}
            onReplayAudio={replayMessageAudio}
            onSendText={sendDirectText}
            quickPhrases={currentDomainPhrases.person_a}
          />

          {/* Person B Panel (Citizen / Visitor) */}
          <TranscriptPanel
            role="person_b"
            title="Person B (Citizen / Visitor)"
            subTitle="Front Window"
            languageCode={personBLang}
            messages={messages}
            partialTranscript={partialTranscript}
            activeSpeaker={activeSpeaker}
            isListening={isCapturing}
            audioLevel={audioLevel}
            isMirrored={isMirrored}
            fontSize={fontSize}
            onReplayAudio={replayMessageAudio}
            onSendText={sendDirectText}
            quickPhrases={currentDomainPhrases.person_b}
          />
        </main>

      </div>

      {/* Counter Kiosk Footer */}
      <footer className="max-w-7xl w-full mx-auto pt-6 pb-2 border-t border-theme-sand/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Session Safe: Zero voice recording persisted. Volatile in-memory processing only.</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline">Faster-Whisper int8 • Neural NMT • 16,000Hz PCM</span>
          <span className="font-extrabold text-theme-terracotta">Civic Eye AI Communication</span>
        </div>
      </footer>
    </div>
  );
}

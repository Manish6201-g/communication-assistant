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
  AlertCircle,
  Cpu,
  Layers,
  Terminal
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
      "Here is your official token slip.",
      "Thank you, have a wonderful day!"
    ],
    person_b: [
      "Hello, I need some assistance please.",
      "Where should I submit this document?",
      "Could you please explain this procedure?",
      "Thank you very much for your help."
    ]
  },
  railway: {
    person_a: [
      "Welcome to Railway Counter. What is your destination?",
      "Platform number 2 is down the escalators on the right.",
      "Your ticket reservation is confirmed.",
      "The express train is arriving on schedule.",
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
      "The physician will examine you shortly.",
      "Here is your prescription for the dispensary.",
      "Take this medication twice daily after meals."
    ],
    person_b: [
      "I have a fever and chest pain since yesterday.",
      "Where is the emergency pharmacy?",
      "Do I need to do any diagnostic tests?",
      "How many times a day should I take this?"
    ]
  },
  public_service: {
    person_a: [
      "Please present your token slip.",
      "Please sign at the bottom of the application form.",
      "Your certificate will be ready in 3 working days.",
      "Your civic grievance has been registered successfully."
    ],
    person_b: [
      "I have come for certificate verification.",
      "Which original documents do I need to attach?",
      "Where is the fee deposit counter located?"
    ]
  }
};

export default function Translator() {
  const [personALang, setPersonALang] = useState('hi'); // Default Hindi (Indic Native)
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
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard Shortcuts (Space to talk, S to switch, F to 180 flip)
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
      } else if (e.code === 'KeyS') {
        handleSwitchSpeaker(activeSpeaker === 'person_a' ? 'person_b' : 'person_a');
      } else if (e.code === 'KeyF') {
        setIsMirrored((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCapturing, activeSpeaker]);

  const currentDomainPhrases = DOMAIN_QUICK_PHRASES[domain] || DOMAIN_QUICK_PHRASES.general;

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 flex flex-col justify-between p-3 sm:p-6 lg:p-8 relative selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Ambient Cybernetic Glowing Orbs */}
      <div className="cyber-glow-orb bg-cyan-600/15 w-[500px] h-[500px] -top-32 -left-32"></div>
      <div className="cyber-glow-orb bg-blue-600/15 w-[600px] h-[600px] -bottom-40 -right-40"></div>

      <div className="max-w-7xl w-full mx-auto space-y-4 sm:space-y-6 relative z-10">
        
        {/* Futuristic Top Navigation */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/40 shadow-neon-cyan">
              <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight font-mono text-white flex items-center gap-2">
                  <span>CIVIC EYE</span>
                  <span className="text-cyan-400">//</span>
                  <span className="text-slate-300 font-sans font-bold">AI ASSISTANT</span>
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  v2.5_NEURAL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                REAL-TIME BIDIRECTIONAL SPEECH TRANSLATION // COUNTERTOP & KIOSK
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              title="Keyboard Shortcuts"
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition shadow-2xs"
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

        {/* Keyboard Shortcuts Drawer */}
        {showShortcuts && (
          <div className="p-4 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-neon-cyan text-xs font-mono flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-4 flex-wrap text-slate-300">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                KEYBOARD_BINDINGS:
              </span>
              <span><kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-mono text-cyan-300">SPACE</kbd> TOGGLE MIC</span>
              <span><kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-mono text-cyan-300">S</kbd> SWITCH SPEAKER</span>
              <span><kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-mono text-cyan-300">F</kbd> 180° COUNTER FLIP</span>
            </div>
            <button 
              onClick={() => setShowShortcuts(false)}
              className="text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Telemetry Stage Latency Ribbon */}
        <LatencyIndicator latency={latestLatency} />

        {/* Microphone Error Alert */}
        {audioError && (
          <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-xs sm:text-sm text-rose-300 font-mono flex items-center justify-between shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-fade-in">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>HARDWARE_ERROR: {audioError}</span>
            </div>
            <button
              onClick={() => handleStartListening()}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-mono font-bold transition shadow-sm active:scale-95"
            >
              RETRY_DEVICE
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

        {/* Tactile Audio Controls Deck with Central Waveform */}
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

        {/* Dual Large Split-Screen Communication Panels */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-stretch">
          {/* Person A Panel (Counter Operator Desk) */}
          <TranscriptPanel
            role="person_a"
            title="CHANNEL_01 // OPERATOR"
            subTitle="DESK_WINDOW"
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
            title="CHANNEL_02 // VISITOR"
            subTitle="CITIZEN_FRONT"
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

      {/* Cyber Kiosk Footer */}
      <footer className="max-w-7xl w-full mx-auto pt-6 pb-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500 relative z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>ZERO_STORAGE GUARANTEE // IN-MEMORY VOLATILE INFERENCE ONLY</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline">FASTER-WHISPER INT8 • DUAL-NMT ENGINE • 16,000Hz PCM</span>
          <span className="font-extrabold text-cyan-400">SMART INDIA HACKATHON 2024</span>
        </div>
      </footer>
    </div>
  );
}

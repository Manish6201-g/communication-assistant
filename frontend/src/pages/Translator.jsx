import React, { useState, useCallback, useEffect } from 'react';
import { AlertCircle, Send, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import DualTouchPills from '../components/DualTouchPills';
import VoiceCore from '../components/VoiceCore';
import TimelineStream from '../components/TimelineStream';
import FaceToFaceView from '../components/FaceToFaceView';
import DualPanelsView from '../components/DualPanelsView';
import LanguageSelectorModal, { LANGUAGES } from '../components/LanguageSelectorModal';
import QuickPhrasesModal from '../components/QuickPhrasesModal';
import DiagnosticsDrawer from '../components/DiagnosticsDrawer';
import { useTranslationSocket } from '../hooks/useTranslationSocket';
import { useAudioCapture } from '../hooks/useAudioCapture';
import { clientTranslationService } from '../services/clientTranslationService';

export default function Translator({ onBackToLanding }) {
  const [personALang, setPersonALang] = useState('hi'); // Default Hindi (Native Indic)
  const [personBLang, setPersonBLang] = useState('en'); // Default English
  const [domain, setDomain] = useState('general');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline', 'facetoface', 'dual'
  const [fontSize, setFontSize] = useState('large'); // 'normal', 'large', 'huge'
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Modals & Drawers
  const [languageModalTarget, setLanguageModalTarget] = useState(null); // 'a' or 'b' or null
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [customText, setCustomText] = useState('');

  // Standalone Client-Side Voice State & Live Hands-Free Loop
  const [isClientListening, setIsClientListening] = useState(false);
  const [clientAudioLevel, setClientAudioLevel] = useState(0);
  const [isLiveAutoMode, setIsLiveAutoMode] = useState(true);
  const isLiveAutoModeRef = useRef(true);
  const handoverTimeoutRef = useRef(null);

  // Speaker TTS Status
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [isSpeakerPlaying, setIsSpeakerPlaying] = useState(false);
  const [livePhase, setLivePhase] = useState('idle'); // idle, listening, translating, speaking, handover
  const [liveStatusText, setLiveStatusText] = useState('');

  // Keep isLiveAutoModeRef synchronized
  useEffect(() => {
    isLiveAutoModeRef.current = isLiveAutoMode;
    if (!isLiveAutoMode && handoverTimeoutRef.current) {
      clearTimeout(handoverTimeoutRef.current);
      handoverTimeoutRef.current = null;
    }
  }, [isLiveAutoMode]);

  const toggleSpeaker = () => {
    const next = !isSpeakerEnabled;
    setIsSpeakerEnabled(next);
    clientTranslationService.setSpeakerEnabled(next);
  };

  // Translation Hook (WebSocket + Multi-Tier NMT Fallback)
  const {
    connectionStatus,
    activeSpeaker,
    messages,
    partialTranscript,
    setPartialTranscript,
    latestLatency,
    sendAudioChunk,
    startListening: startListeningSocket,
    stopListening: stopListeningSocket,
    switchSpeaker,
    sendDirectText,
    clearConversation,
    replayMessageAudio
  } = useTranslationSocket({ personALang, personBLang, domain });

  // Web Audio Capture Hook (16kHz PCM downsampler for backend WebSocket streaming)
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

  // Oscillate visualizer waveform while speaking or playing TTS audio
  useEffect(() => {
    let interval;
    if (isClientListening || isSpeakerPlaying) {
      interval = setInterval(() => {
        setClientAudioLevel(0.35 + Math.random() * 0.45);
      }, 120);
    } else {
      setClientAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [isClientListening, isSpeakerPlaying]);

  const isListening = connectionStatus === 'connected' ? isCapturing : isClientListening;
  const currentAudioLevel = connectionStatus === 'connected' ? audioLevel : clientAudioLevel;

  const getLangName = (code) => {
    const found = LANGUAGES.find((l) => l.code === code);
    return found ? found.name : code.toUpperCase();
  };

  // Direct Start for specific speaker (Speaker A or Speaker B) with Hands-Free Continuous Handover
  const handleStartForSpeaker = async (speaker, isAutoTurn = false) => {
    if (handoverTimeoutRef.current) {
      clearTimeout(handoverTimeoutRef.current);
      handoverTimeoutRef.current = null;
    }

    switchSpeaker(speaker);

    if (connectionStatus === 'connected') {
      await startCapture();
      startListeningSocket(speaker);
    } else {
      const speakerLang = speaker === 'person_a' ? personALang : personBLang;
      const targetLang = speaker === 'person_a' ? personBLang : personALang;
      const speakerLabel = speaker === 'person_a' ? `Operator (${getLangName(personALang)})` : `Visitor (${getLangName(personBLang)})`;
      const targetLabel = speaker === 'person_a' ? `Visitor (${getLangName(personBLang)})` : `Operator (${getLangName(personALang)})`;

      setIsClientListening(true);
      setLivePhase('listening');
      setLiveStatusText(`🎙️ Listening to ${speakerLabel}... Speak now`);

      clientTranslationService.startSpeechRecognition({
        langCode: speakerLang,
        onStart: () => {
          setIsClientListening(true);
          setLivePhase('listening');
        },
        onInterim: (interimText) => {
          setPartialTranscript({
            segment_id: Date.now(),
            speaker_role: speaker,
            source_text: interimText
          });
          setLivePhase('listening');
          setLiveStatusText(`🎙️ ${speakerLabel}: "${interimText}"`);
        },
        onEnd: async (finalText) => {
          setIsClientListening(false);
          setPartialTranscript(null);

          if (finalText && finalText.trim()) {
            setLivePhase('translating');
            setLiveStatusText(`⚡ Translating ${speakerLabel} speech to ${targetLabel}...`);

            await sendDirectText(finalText.trim(), speaker, {
              onSpeechStart: () => {
                setIsSpeakerPlaying(true);
                setLivePhase('speaking');
                setLiveStatusText(`🔊 Speaking translated output out loud to ${targetLabel}...`);
              },
              onSpeechEnd: () => {
                setIsSpeakerPlaying(false);
                setLivePhase('idle');
                setLiveStatusText('');

                // If Live Auto Mode is active, switch turn to the other speaker automatically!
                if (isLiveAutoModeRef.current) {
                  const nextSpeaker = speaker === 'person_a' ? 'person_b' : 'person_a';
                  const nextLabel = nextSpeaker === 'person_a' ? `Operator (${getLangName(personALang)})` : `Visitor (${getLangName(personBLang)})`;
                  setLivePhase('handover');
                  setLiveStatusText(`👉 Turn handed over to ${nextLabel}... Listening automatically`);

                  handoverTimeoutRef.current = setTimeout(() => {
                    if (isLiveAutoModeRef.current) {
                      handleStartForSpeaker(nextSpeaker, true);
                    }
                  }, 400);
                }
              }
            });
          } else {
            // Silence / pause detected
            if (isLiveAutoModeRef.current && isAutoTurn) {
              handoverTimeoutRef.current = setTimeout(() => {
                if (isLiveAutoModeRef.current) {
                  handleStartForSpeaker(speaker, true);
                }
              }, 450);
            } else {
              setLivePhase('idle');
              setLiveStatusText('');
            }
          }
        },
        onError: () => {
          setIsClientListening(false);
          setPartialTranscript(null);
          setLivePhase('idle');
          setLiveStatusText('');
        }
      });
    }
  };

  const handleStopListening = () => {
    if (handoverTimeoutRef.current) {
      clearTimeout(handoverTimeoutRef.current);
      handoverTimeoutRef.current = null;
    }
    if (connectionStatus === 'connected') {
      stopCapture();
      stopListeningSocket();
    } else {
      clientTranslationService.stopSpeechRecognition();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsClientListening(false);
      setPartialTranscript(null);
      setLivePhase('idle');
      setLiveStatusText('');
      setIsSpeakerPlaying(false);
    }
  };

  const handleSwapLanguages = () => {
    clientTranslationService.playFeedbackTone('click');
    const temp = personALang;
    setPersonALang(personBLang);
    setPersonBLang(temp);
  };

  // Fullscreen management
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (isListening) {
          handleStopListening();
        } else {
          handleStartForSpeaker(activeSpeaker);
        }
      } else if (e.code === 'Digit1') {
        setViewMode('timeline');
      } else if (e.code === 'Digit2') {
        setViewMode('facetoface');
      } else if (e.code === 'Digit3') {
        setViewMode('dual');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, activeSpeaker]);

  const handleDirectTextSubmit = async (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    const text = customText.trim();
    setCustomText('');
    setShowTextInput(false);
    await sendDirectText(text, activeSpeaker, {
      onSpeechStart: () => {
        setIsSpeakerPlaying(true);
        setLivePhase('speaking');
        setLiveStatusText('🔊 Speaking translated audio out loud...');
      },
      onSpeechEnd: () => {
        setIsSpeakerPlaying(false);
        setLivePhase('idle');
        setLiveStatusText('');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#080C15] text-slate-100 flex flex-col justify-between p-3 sm:p-5 lg:p-6 pb-6 relative selection:bg-sky-500/20 selection:text-sky-200">
      
      {/* Container */}
      <div className="max-w-7xl w-full mx-auto space-y-4">
        
        {/* Navigation Bar */}
        <Navbar
          connectionStatus={connectionStatus}
          latestLatency={latestLatency}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          domain={domain}
          onChangeDomain={setDomain}
          fontSize={fontSize}
          onChangeFontSize={setFontSize}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onOpenDiagnostics={() => setShowDiagnostics(true)}
          onClearConversation={clearConversation}
          onBackToLanding={onBackToLanding}
        />

        {/* Hero Section */}
        <HeroSection
          onStartConversation={() => handleStartForSpeaker('person_a')}
          onSwitchToTabletop={() => setViewMode('facetoface')}
          onOpenTelemetry={() => setShowDiagnostics(true)}
          isListening={isListening}
          operatorLangName={getLangName(personALang)}
          visitorLangName={getLangName(personBLang)}
        />

        {/* Audio Error Alert if any */}
        {audioError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 text-rose-300 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{audioError}</span>
            </div>
            <button
              onClick={() => handleStartForSpeaker(activeSpeaker)}
              className="px-3 py-1 bg-rose-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-rose-400 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dual Direct-Touch Mic Pods with Live Hands-Free & Speaker Controls */}
        <DualTouchPills
          personALang={personALang}
          personBLang={personBLang}
          isListening={isListening}
          activeSpeaker={activeSpeaker}
          audioLevel={currentAudioLevel}
          isLiveAutoMode={isLiveAutoMode}
          onToggleLiveAutoMode={() => setIsLiveAutoMode(!isLiveAutoMode)}
          isSpeakerEnabled={isSpeakerEnabled}
          onToggleSpeaker={toggleSpeaker}
          isSpeakerPlaying={isSpeakerPlaying}
          onStartForSpeaker={handleStartForSpeaker}
          onStopListening={handleStopListening}
          onOpenLanguageModal={(target) => setLanguageModalTarget(target)}
          onSwapLanguages={handleSwapLanguages}
          onOpenQuickPhrases={() => setShowQuickPhrases(true)}
          onToggleTextInput={() => setShowTextInput(!showTextInput)}
          disabled={false}
        />

        {/* Live Conversation Status & Voice Phase Feedback Banner */}
        {liveStatusText && (
          <div className="w-full max-w-4xl mx-auto p-3 bg-[#0A101D]/90 backdrop-blur-xl border border-sky-400/40 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm shadow-[0_0_25px_rgba(56,189,248,0.2)] animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping flex-shrink-0" />
              <span className="font-semibold text-white truncate">{liveStatusText}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] sm:text-[11px] font-mono uppercase font-bold px-2 py-0.5 rounded-lg border ${
                livePhase === 'listening' ? 'bg-sky-500/15 border-sky-400/40 text-sky-300' :
                livePhase === 'translating' ? 'bg-amber-500/15 border-amber-400/40 text-amber-300' :
                livePhase === 'speaking' ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 animate-pulse' :
                'bg-indigo-500/15 border-indigo-400/40 text-indigo-300'
              }`}>
                {livePhase}
              </span>
            </div>
          </div>
        )}

        {/* Text Input Fallback Bar (if toggled) */}
        {showTextInput && (
          <form
            onSubmit={handleDirectTextSubmit}
            className="w-full max-w-4xl mx-auto p-2 bg-[#0E1524] rounded-2xl border border-white/10 shadow-glass flex items-center gap-2 animate-fade-in"
          >
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={`Type message to translate as ${activeSpeaker === 'person_a' ? getLangName(personALang) : getLangName(personBLang)}...`}
              autoFocus
              className="flex-1 px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/50"
            />
            <button
              type="submit"
              disabled={!customText.trim()}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs disabled:opacity-40 transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Translate</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTextInput(false)}
              className="p-2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Central Fluid Visual Voice Core (ripples when active) */}
        {isListening && (
          <div className="py-1 animate-fade-in">
            <VoiceCore 
              audioLevel={currentAudioLevel} 
              isListening={isListening} 
              activeSpeaker={activeSpeaker} 
            />
          </div>
        )}

        {/* Active Communication Layout */}
        <main className="w-full">
          {viewMode === 'timeline' && (
            <TimelineStream
              messages={messages}
              partialTranscript={partialTranscript}
              activeSpeaker={activeSpeaker}
              isListening={isListening}
              fontSize={fontSize}
              personALang={personALang}
              personBLang={personBLang}
              onReplayAudio={replayMessageAudio}
            />
          )}

          {viewMode === 'facetoface' && (
            <FaceToFaceView
              personALang={personALang}
              personBLang={personBLang}
              messages={messages}
              partialTranscript={partialTranscript}
              activeSpeaker={activeSpeaker}
              fontSize={fontSize}
              onStartForSpeaker={handleStartForSpeaker}
              onStopListening={handleStopListening}
              isListening={isListening}
              onReplayAudio={replayMessageAudio}
            />
          )}

          {viewMode === 'dual' && (
            <DualPanelsView
              personALang={personALang}
              personBLang={personBLang}
              messages={messages}
              partialTranscript={partialTranscript}
              activeSpeaker={activeSpeaker}
              fontSize={fontSize}
              onReplayAudio={replayMessageAudio}
            />
          )}
        </main>
      </div>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={!!languageModalTarget}
        onClose={() => setLanguageModalTarget(null)}
        selectedCode={languageModalTarget === 'a' ? personALang : personBLang}
        onSelect={(code) => {
          if (languageModalTarget === 'a') setPersonALang(code);
          if (languageModalTarget === 'b') setPersonBLang(code);
          setLanguageModalTarget(null);
        }}
        title={`Select Language for ${languageModalTarget === 'a' ? 'Speaker A (Operator)' : 'Speaker B (Visitor)'}`}
      />

      {/* Quick Phrases Modal */}
      <QuickPhrasesModal
        isOpen={showQuickPhrases}
        onClose={() => setShowQuickPhrases(false)}
        domain={domain}
        onSelectPhrase={async (phraseText) => {
          await sendDirectText(phraseText, activeSpeaker, {
            onSpeechStart: () => {
              setIsSpeakerPlaying(true);
              setLivePhase('speaking');
              setLiveStatusText('🔊 Speaking translated phrase out loud...');
            },
            onSpeechEnd: () => {
              setIsSpeakerPlaying(false);
              setLivePhase('idle');
              setLiveStatusText('');
            }
          });
        }}
      />

      {/* Diagnostics Drawer */}
      <DiagnosticsDrawer
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
        latency={latestLatency}
        connectionStatus={connectionStatus}
      />

      {/* Minimal Academic Footer */}
      <footer className="max-w-7xl w-full mx-auto pt-6 text-center text-xs text-slate-500 font-medium">
        Communication Assistant — Real-Time Multilingual Translation System • Department of AI & Data Science, CGC University Mohali
      </footer>
    </div>
  );
}

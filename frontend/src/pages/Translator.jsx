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

export default function Translator() {
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

  // Real Translation WebSocket Hook
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

  // Real Web Audio Capture Hook (16kHz PCM downsampler)
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

  // Direct Start for specific speaker (Operator or Visitor)
  const handleStartForSpeaker = async (speaker) => {
    switchSpeaker(speaker);
    await startCapture();
    startListeningSocket(speaker);
  };

  const handleStopListening = () => {
    stopCapture();
    stopListeningSocket();
  };

  const handleSwapLanguages = () => {
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
        if (isCapturing) {
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
  }, [isCapturing, activeSpeaker]);

  const handleDirectTextSubmit = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    sendDirectText(customText.trim(), activeSpeaker);
    setCustomText('');
    setShowTextInput(false);
  };

  const getLangName = (code) => {
    const found = LANGUAGES.find((l) => l.code === code);
    return found ? found.name : code.toUpperCase();
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
        />

        {/* Hero Section (Originkit Hero-13 Style) */}
        <HeroSection
          onStartConversation={() => handleStartForSpeaker('person_a')}
          onSwitchToTabletop={() => setViewMode('facetoface')}
          onOpenTelemetry={() => setShowDiagnostics(true)}
          isListening={isCapturing}
          operatorLangName={getLangName(personALang)}
          visitorLangName={getLangName(personBLang)}
        />

        {/* Microphone Error Alert */}
        {audioError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs sm:text-sm text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Microphone access issue: {audioError}</span>
            </div>
            <button
              onClick={() => handleStartForSpeaker(activeSpeaker)}
              className="px-3 py-1 bg-rose-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-rose-400 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dual Direct-Touch Mic Pods */}
        <DualTouchPills
          personALang={personALang}
          personBLang={personBLang}
          isListening={isCapturing}
          activeSpeaker={activeSpeaker}
          audioLevel={audioLevel}
          onStartForSpeaker={handleStartForSpeaker}
          onStopListening={handleStopListening}
          onOpenLanguageModal={(target) => setLanguageModalTarget(target)}
          onSwapLanguages={handleSwapLanguages}
          onOpenQuickPhrases={() => setShowQuickPhrases(true)}
          onToggleTextInput={() => setShowTextInput(!showTextInput)}
          disabled={connectionStatus !== 'connected'}
        />

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
              placeholder={`Type message to translate as ${activeSpeaker === 'person_a' ? 'Operator' : 'Visitor'}...`}
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
        {isCapturing && (
          <div className="py-1 animate-fade-in">
            <VoiceCore 
              audioLevel={audioLevel} 
              isListening={isCapturing} 
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
              isListening={isCapturing}
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
              isListening={isCapturing}
              fontSize={fontSize}
              onStartForSpeaker={handleStartForSpeaker}
              onStopListening={handleStopListening}
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
              isListening={isCapturing}
              fontSize={fontSize}
              onReplayAudio={replayMessageAudio}
            />
          )}
        </main>

      </div>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={languageModalTarget !== null}
        onClose={() => setLanguageModalTarget(null)}
        selectedCode={languageModalTarget === 'a' ? personALang : personBLang}
        onSelect={(code) => {
          if (languageModalTarget === 'a') setPersonALang(code);
          else setPersonBLang(code);
        }}
        title={languageModalTarget === 'a' ? "Select Operator Language" : "Select Visitor Language"}
      />

      {/* Quick Phrases Modal */}
      <QuickPhrasesModal
        isOpen={showQuickPhrases}
        onClose={() => setShowQuickPhrases(false)}
        domain={domain}
        activeSpeaker={activeSpeaker}
        onSelectPhrase={sendDirectText}
      />

      {/* Telemetry Slide-Over Drawer */}
      <DiagnosticsDrawer
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
        latency={latestLatency}
        connectionStatus={connectionStatus}
      />

      {/* Minimal Footer */}
      <footer className="max-w-7xl w-full mx-auto pt-6 text-center text-xs text-slate-500 font-medium">
        CivicEye • Zero Audio Storage Privacy • Faster-Whisper & Multilingual Neural Translation
      </footer>
    </div>
  );
}

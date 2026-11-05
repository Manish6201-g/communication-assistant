import React from 'react';
import { 
  Mic, 
  MicOff, 
  ArrowLeftRight, 
  Sparkles, 
  Keyboard, 
  ChevronDown,
  Volume2,
  VolumeX,
  Radio,
  Zap
} from 'lucide-react';
import { LANGUAGES } from './LanguageSelectorModal';

export default function DualTouchPills({
  personALang,
  personBLang,
  isListening,
  activeSpeaker,
  audioLevel,
  isLiveAutoMode = true,
  onToggleLiveAutoMode,
  isSpeakerEnabled = true,
  onToggleSpeaker,
  isSpeakerPlaying = false,
  onStartForSpeaker,
  onStopListening,
  onOpenLanguageModal,
  onSwapLanguages,
  onOpenQuickPhrases,
  onToggleTextInput,
  disabled
}) {
  const getLang = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
  const langA = getLang(personALang);
  const langB = getLang(personBLang);

  const isOperatorSpeaking = isListening && activeSpeaker === 'person_a';
  const isVisitorSpeaking = isListening && activeSpeaker === 'person_b';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2.5">
      
      {/* Top Hands-Free Live Mode & Speaker Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#0A0F1D]/80 backdrop-blur-md rounded-2xl border border-white/5 text-xs">
        
        {/* Live Auto-Conversation Mode Pill */}
        <button
          onClick={onToggleLiveAutoMode}
          title={isLiveAutoMode ? "Live Auto-Conversation is ON: Speaks and listens hands-free back-and-forth" : "Click to enable Live Hands-Free Auto-Conversation"}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition-all border ${
            isLiveAutoMode
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              : 'bg-slate-900 border-white/10 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isLiveAutoMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <Radio className="w-3.5 h-3.5" />
          <span>LIVE AUTO-CONVERSATION: {isLiveAutoMode ? 'ACTIVE (HANDS-FREE)' : 'OFF (MANUAL)'}</span>
        </button>

        {/* Speaker Auto-TTS Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSpeaker}
            title={isSpeakerEnabled ? "Speaker Output is ON: Spoken translations play out loud automatically" : "Speaker is Muted"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold transition-all border ${
              isSpeakerEnabled
                ? isSpeakerPlaying
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {isSpeakerEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeakerPlaying ? 'SPEAKING AUDIO...' : 'SPEAKER: ON'}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>SPEAKER: MUTED</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Dual-Touch Station */}
      <div className="bg-[#0D1322]/90 backdrop-blur-2xl rounded-3xl border border-white/10 p-3 sm:p-4 shadow-glass">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Operator Direct-Touch Pod */}
          <div className={`flex-1 w-full rounded-2xl p-3 sm:p-3.5 border transition-all duration-300 flex items-center justify-between gap-3 ${
            isOperatorSpeaking
              ? 'bg-sky-950/40 border-sky-400/60 shadow-[0_0_25px_rgba(56,189,248,0.25)] ring-2 ring-sky-400/30'
              : 'bg-slate-900/80 border-white/5 hover:border-white/10'
          }`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">Operator (You)</span>
                {langA.category === 'indic' && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Indic
                  </span>
                )}
              </div>
              <button
                onClick={() => onOpenLanguageModal('a')}
                disabled={isListening}
                className="flex items-center gap-1.5 text-left mt-0.5 hover:opacity-80 transition disabled:opacity-50"
              >
                <span className="text-base" role="img" aria-label={langA.name}>{langA.flag}</span>
                <span className="text-sm font-bold text-white truncate">{langA.name}</span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">({langA.native})</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>
            </div>

            {/* Direct Tap-to-Speak Button for Operator */}
            <button
              onClick={() => {
                if (isOperatorSpeaking) {
                  onStopListening();
                } else {
                  onStartForSpeaker('person_a');
                }
              }}
              disabled={disabled}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all active:scale-95 disabled:opacity-40 shadow-sm ${
                isOperatorSpeaking
                  ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-glow-sky animate-pulse'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
              }`}
            >
              {isOperatorSpeaking ? (
                <>
                  <MicOff className="w-4 h-4 text-slate-950" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-sky-400" />
                  <span>Speak {langA.name}</span>
                </>
              )}
            </button>
          </div>

          {/* Central Actions (Swap, Quick Phrases, Keyboard) */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 self-center">
            <button
              onClick={onSwapLanguages}
              disabled={isListening}
              title="Swap Operator and Visitor languages"
              className="p-3 rounded-2xl bg-slate-900/90 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition active:scale-90 disabled:opacity-40"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenQuickPhrases}
              title="Quick Service Phrases"
              className="p-3 rounded-2xl bg-slate-900/90 hover:bg-white/10 text-slate-400 hover:text-sky-300 border border-white/10 transition active:scale-90"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleTextInput}
              title="Type to translate (keyboard input fallback)"
              className="p-3 rounded-2xl bg-slate-900/90 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition active:scale-90"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>

          {/* Visitor Direct-Touch Pod */}
          <div className={`flex-1 w-full rounded-2xl p-3 sm:p-3.5 border transition-all duration-300 flex items-center justify-between gap-3 ${
            isVisitorSpeaking
              ? 'bg-indigo-950/40 border-indigo-400/60 shadow-[0_0_25px_rgba(99,102,241,0.25)] ring-2 ring-indigo-400/30'
              : 'bg-slate-900/80 border-white/5 hover:border-white/10'
          }`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Visitor / Citizen</span>
                {langB.category === 'indic' && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Indic
                  </span>
                )}
              </div>
              <button
                onClick={() => onOpenLanguageModal('b')}
                disabled={isListening}
                className="flex items-center gap-1.5 text-left mt-0.5 hover:opacity-80 transition disabled:opacity-50"
              >
                <span className="text-base" role="img" aria-label={langB.name}>{langB.flag}</span>
                <span className="text-sm font-bold text-white truncate">{langB.name}</span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">({langB.native})</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>
            </div>

            {/* Direct Tap-to-Speak Button for Visitor */}
            <button
              onClick={() => {
                if (isVisitorSpeaking) {
                  onStopListening();
                } else {
                  onStartForSpeaker('person_b');
                }
              }}
              disabled={disabled}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all active:scale-95 disabled:opacity-40 shadow-sm ${
                isVisitorSpeaking
                  ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-pulse'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
              }`}
            >
              {isVisitorSpeaking ? (
                <>
                  <MicOff className="w-4 h-4 text-white" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-indigo-400" />
                  <span>Speak {langB.name}</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

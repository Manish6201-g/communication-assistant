import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  User, 
  Users, 
  Sparkles, 
  Send, 
  Keyboard,
  ChevronUp
} from 'lucide-react';
import AudioWaveform from './AudioWaveform';

export default function ControlDock({
  isListening,
  onStartListening,
  onStopListening,
  activeSpeaker,
  onSwitchSpeaker,
  audioLevel,
  onOpenQuickPhrases,
  onSendText,
  disabled
}) {
  const [showTextInput, setShowTextInput] = useState(false);
  const [typedText, setTypedText] = useState('');

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!typedText.trim()) return;
    onSendText(typedText.trim(), activeSpeaker);
    setTypedText('');
    setShowTextInput(false);
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-auto">
      
      {/* Optional Direct Text Fallback Drawer */}
      {showTextInput && (
        <form
          onSubmit={handleTextSubmit}
          className="mb-2 p-2 bg-[#0E1524]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-dock flex items-center gap-2 animate-fade-in"
        >
          <input
            type="text"
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder={`Type message as ${activeSpeaker === 'person_a' ? 'Operator' : 'Visitor'}...`}
            autoFocus
            className="flex-1 px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400/50"
          />
          <button
            type="submit"
            disabled={!typedText.trim()}
            className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold disabled:opacity-40 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Main Floating Capsule Dock */}
      <div className="glass-dock rounded-3xl p-2.5 sm:p-3 shadow-dock flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Active Speaker Switcher */}
        <div className="flex items-center bg-black/40 rounded-2xl p-1 border border-white/5 w-full sm:w-auto justify-center">
          <button
            onClick={() => onSwitchSpeaker('person_a')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeSpeaker === 'person_a'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Operator</span>
          </button>

          <button
            onClick={() => onSwitchSpeaker('person_b')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeSpeaker === 'person_b'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Visitor</span>
          </button>
        </div>

        {/* Center: Waveform & Mic Trigger Button */}
        <div className="flex items-center gap-3">
          {/* Real Audio Waveform */}
          <div className="hidden md:flex items-center bg-black/30 rounded-2xl border border-white/5">
            <AudioWaveform audioLevel={audioLevel} isActive={isListening} barsCount={16} />
          </div>

          {/* Primary Conversation Mic Button */}
          <button
            onClick={isListening ? onStopListening : onStartListening}
            disabled={disabled}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-50 ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-glow-rose ring-4 ring-rose-500/20'
                : 'bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black shadow-glow-sky'
            }`}
          >
            {isListening ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                <MicOff className="w-4 h-4" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Start Conversation</span>
              </>
            )}
          </button>
        </div>

        {/* Auxiliary Actions: Quick Responses & Text Input */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
          <button
            onClick={onOpenQuickPhrases}
            title="Standard service responses"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Quick Phrases</span>
          </button>

          <button
            onClick={() => setShowTextInput(!showTextInput)}
            title="Type to translate (keyboard fallback)"
            className={`p-2 rounded-xl border transition ${
              showTextInput
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/5'
            }`}
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

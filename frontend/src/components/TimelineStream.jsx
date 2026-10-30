import React, { useRef, useEffect, useState } from 'react';
import { 
  Volume2, 
  Copy, 
  Check, 
  Clock, 
  Sparkles, 
  User, 
  Users, 
  Radio, 
  CornerDownRight,
  Languages
} from 'lucide-react';
import { LANGUAGES } from './LanguageSelectorModal';

export default function TimelineStream({
  messages,
  partialTranscript,
  activeSpeaker,
  isListening,
  fontSize = 'large',
  personALang,
  personBLang,
  onReplayAudio
}) {
  const scrollRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  const getLang = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
  const langA = getLang(personALang);
  const langB = getLang(personBLang);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, partialTranscript]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReplay = (msg) => {
    setPlayingId(msg.id);
    onReplayAudio(msg);
    setTimeout(() => setPlayingId(null), 3000);
  };

  const fontSizes = {
    normal: 'text-base sm:text-lg',
    large: 'text-xl sm:text-2xl',
    huge: 'text-2xl sm:text-3xl'
  };
  const activeFontSize = fontSizes[fontSize] || fontSizes.large;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[520px] lg:h-[600px] bg-[#0E1524]/70 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-glass overflow-hidden">
      
      {/* Stream Sub-header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Conversation Stream</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            Operator ({langA.name})
          </span>
          <span className="text-slate-600">↔</span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            Visitor ({langB.name})
          </span>
        </div>
      </div>

      {/* Main Flowing Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-gradient-to-b from-transparent to-black/20"
      >
        {messages.length === 0 && !partialTranscript && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-sky-400 mb-3 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-base font-bold text-slate-200">Conversation Timeline</h4>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
              Tap either "Speak {langA.name}" or "Speak {langB.name}" below. Both parties' speech and real-time translations will flow here chronologically.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isOperator = msg.speaker_role === 'person_a';
          const isPlaying = playingId === msg.id;
          const speakerLang = isOperator ? langA : langB;
          const targetLang = isOperator ? langB : langA;

          return (
            <div
              key={msg.id}
              className={`p-5 rounded-2xl border transition-all duration-200 animate-fade-in ${
                isOperator
                  ? 'bg-slate-900/90 border-sky-500/20 shadow-card-subtle ml-0 mr-auto max-w-2xl'
                  : 'bg-[#121B30]/90 border-indigo-500/20 shadow-card-subtle mr-0 ml-auto max-w-2xl'
              }`}
            >
              {/* Card Meta Bar */}
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isOperator ? 'bg-sky-500/20 text-sky-300' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {isOperator ? <User className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                  </div>
                  <span className="font-bold text-slate-300 text-xs">
                    {isOperator ? 'Operator' : 'Visitor'}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    ({speakerLang.code.toUpperCase()} → {targetLang.code.toUpperCase()})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                  <Clock className="w-3 h-3" />
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {/* Translated Speech (Prominent, High-Contrast) */}
              <p className={`${activeFontSize} font-bold text-white leading-relaxed tracking-tight`}>
                {msg.translated_text}
              </p>

              {/* Original Speech Subtitle */}
              <p className="text-xs text-slate-400 mt-2.5 font-medium italic border-l-2 border-white/10 pl-3">
                Original: "{msg.source_text}"
              </p>

              {/* Action Toolbar */}
              <div className="mt-3.5 pt-2 flex items-center justify-between border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReplay(msg)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isPlaying
                        ? 'bg-sky-500 text-slate-950 font-black shadow-glow-sky'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlaying ? 'Speaking...' : 'Listen'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(msg.id, msg.translated_text)}
                    title="Copy translated text"
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {msg.latency?.total_ms > 0 && (
                  <span className="text-[11px] font-mono text-slate-500 font-medium">
                    ⚡ {msg.latency.total_ms}ms
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Streaming Transcription Box */}
        {partialTranscript && (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-sky-400/40 border-dashed animate-pulse max-w-xl mx-auto">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-3.5 h-3.5" />
              <span>Transcribing {partialTranscript.speaker_role === 'person_a' ? 'Operator' : 'Visitor'}...</span>
            </span>
            <p className={`${activeFontSize} font-semibold text-slate-200 mt-1.5 italic`}>
              "{partialTranscript.source_text}..."
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

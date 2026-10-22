import React, { useRef, useEffect, useState } from 'react';
import { 
  Volume2, 
  Copy, 
  Check, 
  Clock, 
  Sparkles, 
  Mic, 
  User, 
  Users,
  CornerDownRight,
  Radio
} from 'lucide-react';
import { LANGUAGES } from './LanguageSelectorModal';

export default function TranscriptView({
  personALang,
  personBLang,
  messages,
  partialTranscript,
  activeSpeaker,
  isListening,
  audioLevel,
  isMirrored,
  fontSize = 'large',
  onReplayAudio
}) {
  const scrollRefA = useRef(null);
  const scrollRefB = useRef(null);

  const [copiedId, setCopiedId] = useState(null);
  const [playingId, setPlayingId] = useState(null);

  const getLang = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
  const langA = getLang(personALang);
  const langB = getLang(personBLang);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRefA.current) {
      scrollRefA.current.scrollTo({ top: scrollRefA.current.scrollHeight, behavior: 'smooth' });
    }
    if (scrollRefB.current) {
      scrollRefB.current.scrollTo({ top: scrollRefB.current.scrollHeight, behavior: 'smooth' });
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

  // Font size scale map
  const fontSizes = {
    normal: 'text-base sm:text-lg',
    large: 'text-xl sm:text-2xl',
    huge: 'text-2xl sm:text-3xl'
  };
  const activeFontSize = fontSizes[fontSize] || fontSizes.large;

  // Single panel renderer
  const renderPanel = (role, title, lang, scrollRef, isFlipped = false) => {
    const isCurrentSpeaker = activeSpeaker === role;
    const isMicActive = isCurrentSpeaker && isListening;

    return (
      <div 
        className={`flex-1 flex flex-col h-[520px] lg:h-[580px] bg-[#0E1524]/90 rounded-2xl border transition-all duration-300 overflow-hidden shadow-glass ${
          isMicActive 
            ? 'border-sky-500/50 ring-2 ring-sky-500/20' 
            : 'border-white/10'
        } ${isFlipped ? 'flip-180' : ''}`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.02] border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
              isMicActive 
                ? 'bg-sky-500 text-slate-950 font-black shadow-glow-sky' 
                : 'bg-white/5 text-slate-300'
            }`}>
              {role === 'person_a' ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm tracking-tight">{title}</span>
                <span className="text-xs text-slate-400 font-mono">({lang.code.toUpperCase()})</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {lang.name} <span className="text-slate-500">• {lang.native}</span>
              </span>
            </div>
          </div>

          {/* Live Mic Status Indicator */}
          {isMicActive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Speaking</span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 font-medium">
              {isCurrentSpeaker ? 'Active Channel' : 'Ready'}
            </span>
          )}
        </div>

        {/* Message Stream */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-gradient-to-b from-transparent to-black/20"
        >
          {messages.length === 0 && !partialTranscript && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 mb-3 border border-white/5">
                <Sparkles className="w-5 h-5 text-sky-400/70" />
              </div>
              <p className="text-sm font-medium text-slate-300">Ready for conversation</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                Spoken phrases in {lang.name} will be transcribed and translated automatically in real time.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isOrigin = msg.speaker_role === role;
            const displayText = isOrigin ? msg.source_text : msg.translated_text;
            const subtitleText = isOrigin 
              ? `Translated: "${msg.translated_text}"` 
              : `Original: "${msg.source_text}"`;
            const isPlaying = playingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`p-4 rounded-xl border transition-all ${
                  isOrigin
                    ? 'bg-slate-900/90 border-white/5 hover:border-white/10'
                    : 'bg-sky-950/20 border-sky-500/20 hover:border-sky-500/40 shadow-card-subtle'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                    {isOrigin ? 'Spoken' : 'Translation'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {/* Primary High-Contrast Text */}
                <p className={`${activeFontSize} font-bold text-white leading-relaxed tracking-tight`}>
                  {displayText}
                </p>

                {/* Secondary Reference Text */}
                <p className="text-xs text-slate-400 mt-2 font-medium italic border-l-2 border-white/10 pl-2.5">
                  {subtitleText}
                </p>

                {/* Utility Actions */}
                <div className="mt-3 pt-2 flex items-center justify-between border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReplay(msg)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        isPlaying 
                          ? 'bg-sky-500 text-slate-950 font-bold' 
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPlaying ? 'Playing...' : 'Play'}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(msg.id, displayText)}
                      title="Copy to clipboard"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {msg.latency && msg.latency.total_ms > 0 && (
                    <span className="text-[11px] font-mono text-slate-500">
                      {msg.latency.total_ms}ms
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Real-time Streaming Caption Preview */}
          {partialTranscript && partialTranscript.speaker_role === role && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-sky-500/30 border-dashed animate-pulse">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                Listening & transcribing...
              </span>
              <p className={`${activeFontSize} font-semibold text-slate-200 mt-1 italic leading-relaxed`}>
                "{partialTranscript.source_text}..."
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 items-stretch">
      {/* Operator Panel (Person A) */}
      {renderPanel('person_a', 'Operator', langA, scrollRefA, false)}

      {/* Visitor Panel (Person B) - Inverts 180° when isMirrored is enabled */}
      {renderPanel('person_b', 'Visitor', langB, scrollRefB, isMirrored)}
    </div>
  );
}

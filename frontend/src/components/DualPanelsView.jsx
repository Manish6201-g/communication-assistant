import React, { useRef, useEffect, useState } from 'react';
import { Volume2, Copy, Check, Clock, User, Users, Radio } from 'lucide-react';
import { LANGUAGES } from './LanguageSelectorModal';

export default function DualPanelsView({
  personALang,
  personBLang,
  messages,
  partialTranscript,
  activeSpeaker,
  isListening,
  fontSize = 'large',
  onReplayAudio
}) {
  const scrollRefA = useRef(null);
  const scrollRefB = useRef(null);
  const [copiedId, setCopiedId] = useState(null);

  const getLang = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
  const langA = getLang(personALang);
  const langB = getLang(personBLang);

  useEffect(() => {
    if (scrollRefA.current) scrollRefA.current.scrollTo({ top: scrollRefA.current.scrollHeight, behavior: 'smooth' });
    if (scrollRefB.current) scrollRefB.current.scrollTo({ top: scrollRefB.current.scrollHeight, behavior: 'smooth' });
  }, [messages, partialTranscript]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fontSizes = {
    normal: 'text-base sm:text-lg',
    large: 'text-xl sm:text-2xl',
    huge: 'text-2xl sm:text-3xl'
  };
  const activeFontSize = fontSizes[fontSize] || fontSizes.large;

  const renderColumn = (role, title, lang, scrollRef, isLeft) => {
    const isCurrentSpeaker = isListening && activeSpeaker === role;

    return (
      <div className={`flex-1 flex flex-col h-[520px] lg:h-[580px] bg-[#0E1524]/90 rounded-3xl border transition-all duration-300 overflow-hidden shadow-glass ${
        isCurrentSpeaker 
          ? isLeft ? 'border-sky-500/50 ring-2 ring-sky-500/20' : 'border-indigo-500/50 ring-2 ring-indigo-500/20'
          : 'border-white/10'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.02] border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl" role="img">{lang.flag}</span>
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${isLeft ? 'text-sky-400' : 'text-indigo-400'}`}>
                {title}
              </span>
              <span className="text-sm font-semibold text-white">{lang.name} ({lang.native})</span>
            </div>
          </div>

          {isCurrentSpeaker && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Speaking
            </span>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs p-6">
              Messages will appear here as speech is recognized and translated.
            </div>
          )}
          {messages.map((msg) => {
            const isOrigin = msg.speaker_role === role;
            const text = isOrigin ? msg.source_text : msg.translated_text;
            const sub = isOrigin ? `Translated: "${msg.translated_text}"` : `Original: "${msg.source_text}"`;

            return (
              <div key={msg.id} className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                    {isOrigin ? 'Spoken' : 'Translation'}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">{msg.timestamp}</span>
                </div>
                <p className={`${activeFontSize} font-bold text-white leading-relaxed`}>{text}</p>
                <p className="text-xs text-slate-400 italic border-l-2 border-white/10 pl-2">{sub}</p>
                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <button
                    onClick={() => onReplayAudio(msg)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                  <button
                    onClick={() => handleCopy(msg.id, text)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Partial preview */}
          {partialTranscript && partialTranscript.speaker_role === role && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-sky-400/40 border-dashed animate-pulse">
              <span className="text-xs font-semibold text-sky-400 flex items-center gap-1.5 uppercase">
                <Radio className="w-3.5 h-3.5" /> Transcribing...
              </span>
              <p className={`${activeFontSize} font-semibold text-slate-200 mt-1 italic`}>
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
      {renderColumn('person_a', 'Operator Desk', langA, scrollRefA, true)}
      {renderColumn('person_b', 'Visitor Window', langB, scrollRefB, false)}
    </div>
  );
}

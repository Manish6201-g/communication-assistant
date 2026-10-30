import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, User, Users, Clock } from 'lucide-react';
import { LANGUAGES } from './LanguageSelectorModal';

export default function FaceToFaceView({
  personALang,
  personBLang,
  messages,
  partialTranscript,
  activeSpeaker,
  isListening,
  fontSize = 'large',
  onStartForSpeaker,
  onStopListening,
  onReplayAudio
}) {
  const scrollRefA = useRef(null);
  const scrollRefB = useRef(null);

  const getLang = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
  const langA = getLang(personALang);
  const langB = getLang(personBLang);

  const isOperatorListening = isListening && activeSpeaker === 'person_a';
  const isVisitorListening = isListening && activeSpeaker === 'person_b';

  useEffect(() => {
    if (scrollRefA.current) scrollRefA.current.scrollTo({ top: scrollRefA.current.scrollHeight, behavior: 'smooth' });
    if (scrollRefB.current) scrollRefB.current.scrollTo({ top: scrollRefB.current.scrollHeight, behavior: 'smooth' });
  }, [messages, partialTranscript]);

  const fontSizes = {
    normal: 'text-base sm:text-lg',
    large: 'text-xl sm:text-2xl',
    huge: 'text-2xl sm:text-3xl'
  };
  const activeFontSize = fontSizes[fontSize] || fontSizes.large;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[600px] gap-3">
      
      {/* Top Half: Visitor Side (Inverted 180° for Tabletop Viewing) */}
      <div className="flex-1 flex flex-col bg-[#0E1524]/90 rounded-3xl border border-white/10 shadow-glass overflow-hidden flip-180 transition-all duration-300">
        {/* Visitor Controls Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-white/[0.03] border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl" role="img">{langB.flag}</span>
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Visitor Screen</span>
              <span className="text-sm font-semibold text-white">{langB.name} ({langB.native})</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (isVisitorListening) onStopListening();
              else onStartForSpeaker('person_b');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
              isVisitorListening
                ? 'bg-indigo-500 text-white shadow-glow-rose animate-pulse'
                : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            {isVisitorListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
            <span>{isVisitorListening ? 'Stop' : `Speak ${langB.name}`}</span>
          </button>
        </div>

        {/* Visitor Transcript Stream */}
        <div ref={scrollRefB} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs p-4">
              Tap "Speak {langB.name}" to talk across the counter.
            </div>
          )}
          {messages.map((msg) => {
            const isOrigin = msg.speaker_role === 'person_b';
            const textToShow = isOrigin ? msg.source_text : msg.translated_text;
            return (
              <div key={msg.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-white/5">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  {isOrigin ? 'You Said' : 'Operator Translation'}
                </span>
                <p className={`${activeFontSize} font-bold text-white leading-relaxed`}>{textToShow}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider Marker */}
      <div className="flex items-center justify-center text-slate-600 text-xs font-mono uppercase tracking-widest gap-2">
        <span>────── Counter Divider ──────</span>
      </div>

      {/* Bottom Half: Operator Side (Normal Orientation) */}
      <div className="flex-1 flex flex-col bg-[#0E1524]/90 rounded-3xl border border-white/10 shadow-glass overflow-hidden transition-all duration-300">
        {/* Operator Controls Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-white/[0.03] border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="text-xl" role="img">{langA.flag}</span>
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">Operator Screen</span>
              <span className="text-sm font-semibold text-white">{langA.name} ({langA.native})</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (isOperatorListening) onStopListening();
              else onStartForSpeaker('person_a');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${
              isOperatorListening
                ? 'bg-sky-500 text-slate-950 font-black shadow-glow-sky animate-pulse'
                : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            {isOperatorListening ? <MicOff className="w-4 h-4 text-slate-950" /> : <Mic className="w-4 h-4 text-sky-400" />}
            <span>{isOperatorListening ? 'Stop' : `Speak ${langA.name}`}</span>
          </button>
        </div>

        {/* Operator Transcript Stream */}
        <div ref={scrollRefA} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs p-4">
              Tap "Speak {langA.name}" to talk with the visitor.
            </div>
          )}
          {messages.map((msg) => {
            const isOrigin = msg.speaker_role === 'person_a';
            const textToShow = isOrigin ? msg.source_text : msg.translated_text;
            return (
              <div key={msg.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-white/5">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">
                  {isOrigin ? 'You Said' : 'Visitor Translation'}
                </span>
                <p className={`${activeFontSize} font-bold text-white leading-relaxed`}>{textToShow}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

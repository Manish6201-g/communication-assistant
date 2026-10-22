import React, { useState } from 'react';
import { ArrowLeftRight, ChevronDown, Sparkles, Building2, Train, Stethoscope, Landmark } from 'lucide-react';
import LanguageSelectorModal, { LANGUAGES } from './LanguageSelectorModal';

export const DOMAINS = [
  { id: 'general', name: 'General Counter', icon: Landmark, description: 'General public inquiries' },
  { id: 'railway', name: 'Railway & Transit', icon: Train, description: 'Ticketing, platforms & schedules' },
  { id: 'medical', name: 'Healthcare & Clinic', icon: Stethoscope, description: 'Symptoms, triage & prescriptions' },
  { id: 'public_service', name: 'Civic Administration', icon: Building2, description: 'Certificates & citizen services' },
];

export default function LanguageBar({
  personALang,
  setPersonALang,
  personBLang,
  setPersonBLang,
  domain,
  setDomain,
  disabled
}) {
  const [modalTarget, setModalTarget] = useState(null); // 'a' or 'b' or null

  const getLang = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
  const langA = getLang(personALang);
  const langB = getLang(personBLang);

  const handleSwap = () => {
    const temp = personALang;
    setPersonALang(personBLang);
    setPersonBLang(temp);
  };

  return (
    <>
      <div className="w-full bg-[#0E1524]/80 backdrop-blur-md rounded-2xl border border-white/10 p-2 sm:p-2.5 shadow-glass">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Dual Language Selector Controls */}
          <div className="flex-1 flex items-center gap-1.5 sm:gap-2">
            
            {/* Person A (Operator) Button */}
            <button
              onClick={() => setModalTarget('a')}
              disabled={disabled}
              className="flex-1 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/5 hover:border-white/15 transition text-left group disabled:opacity-50"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl flex-shrink-0" role="img" aria-label={langA.name}>
                  {langA.flag}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operator</span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">• {langA.code.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white truncate">{langA.name}</span>
                    <span className="text-xs text-slate-400 font-medium truncate hidden lg:inline">({langA.native})</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition flex-shrink-0 ml-1.5" />
            </button>

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={disabled}
              title="Swap Operator and Visitor languages"
              className="p-2.5 sm:p-3 rounded-xl bg-slate-900/90 hover:bg-sky-500/10 text-slate-400 hover:text-sky-300 border border-white/5 hover:border-sky-500/30 transition transform active:scale-90 duration-200 flex-shrink-0 disabled:opacity-40"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {/* Person B (Visitor) Button */}
            <button
              onClick={() => setModalTarget('b')}
              disabled={disabled}
              className="flex-1 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/5 hover:border-white/15 transition text-left group disabled:opacity-50"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl flex-shrink-0" role="img" aria-label={langB.name}>
                  {langB.flag}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visitor</span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">• {langB.code.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white truncate">{langB.name}</span>
                    <span className="text-xs text-slate-400 font-medium truncate hidden lg:inline">({langB.native})</span>
                  </div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition flex-shrink-0 ml-1.5" />
            </button>

          </div>

          {/* Service Domain Context Selector */}
          <div className="flex items-center gap-2 self-stretch md:self-auto md:w-56 bg-slate-900/90 border border-white/5 rounded-xl px-3 py-1.5">
            <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer py-1"
            >
              {DOMAINS.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#0E1524] text-white">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={modalTarget !== null}
        onClose={() => setModalTarget(null)}
        selectedCode={modalTarget === 'a' ? personALang : personBLang}
        onSelect={(code) => {
          if (modalTarget === 'a') {
            setPersonALang(code);
          } else {
            setPersonBLang(code);
          }
        }}
        title={modalTarget === 'a' ? "Select Operator Language" : "Select Visitor Language"}
      />
    </>
  );
}

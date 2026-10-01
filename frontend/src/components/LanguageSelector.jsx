import React from 'react';
import { ArrowLeftRight, Sparkles, Building2, Train, Stethoscope, Landmark } from 'lucide-react';

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳', region: 'India', native: 'हिन्दी' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳', region: 'India', native: 'ਪੰਜਾਬੀ' },
  { code: 'en', name: 'English', flag: '🇬🇧', region: 'Global', native: 'English' },
  { code: 'bn', name: 'Bengali (বাংলা)', flag: '🇮🇳', region: 'India', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil (தமிழ்)', flag: '🇮🇳', region: 'India', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu (తెలుగు)', flag: '🇮🇳', region: 'India', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi (मराठी)', flag: '🇮🇳', region: 'India', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)', flag: '🇮🇳', region: 'India', native: 'ગુજરાતી' },
  { code: 'ur', name: 'Urdu (اردو)', flag: '🇮🇳', region: 'India', native: 'اردو' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸', region: 'Global', native: 'Español' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷', region: 'Global', native: 'Français' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪', region: 'Global', native: 'Deutsch' },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇸🇦', region: 'Global', native: 'العربية' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵', region: 'Global', native: '日本語' },
];

export const DOMAINS = [
  { id: 'general', name: 'Public Desk / Civic Counter', icon: Landmark },
  { id: 'railway', name: 'Railway Station & Transport', icon: Train },
  { id: 'medical', name: 'Healthcare & Hospital Clinic', icon: Stethoscope },
  { id: 'public_service', name: 'Government Administration', icon: Building2 },
];

export default function LanguageSelector({
  personALang,
  setPersonALang,
  personBLang,
  setPersonBLang,
  domain,
  setDomain,
  disabled
}) {
  const handleSwap = () => {
    const temp = personALang;
    setPersonALang(personBLang);
    setPersonBLang(temp);
  };

  const getLanguage = (code) => SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];

  const langA = getLanguage(personALang);
  const langB = getLanguage(personBLang);

  return (
    <div className="bg-theme-card/95 backdrop-blur-md rounded-3xl p-5 shadow-warm border border-theme-sand/70">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Person A Language Card */}
        <div className="flex-1 bg-theme-surface/90 rounded-2xl p-3.5 border border-theme-sand/80 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-theme-terracotta flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-theme-terracotta"></span>
              Person A (Counter Operator)
            </span>
            {langA.region === 'India' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Native Indic
              </span>
            )}
          </div>
          <div className="relative">
            <select
              value={personALang}
              onChange={(e) => setPersonALang(e.target.value)}
              disabled={disabled}
              className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-white border border-theme-sand text-theme-dark font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-theme-terracotta transition cursor-pointer disabled:opacity-60 shadow-2xs"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={`a-${lang.code}`} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button with Circular Terracotta Accent */}
        <div className="flex items-center justify-center self-center my-[-4px] lg:my-0">
          <button
            onClick={handleSwap}
            disabled={disabled}
            title="Swap Languages between Operator and Visitor"
            className="p-3.5 rounded-2xl bg-theme-cream hover:bg-theme-sand text-theme-terracotta transition transform active:scale-90 hover:rotate-180 duration-300 border border-theme-sand shadow-sm disabled:opacity-50"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
        </div>

        {/* Person B Language Card */}
        <div className="flex-1 bg-theme-surface/90 rounded-2xl p-3.5 border border-theme-sand/80 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-theme-dark flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-theme-sand"></span>
              Person B (Visitor / Citizen)
            </span>
            {langB.region === 'India' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Native Indic
              </span>
            )}
          </div>
          <div className="relative">
            <select
              value={personBLang}
              onChange={(e) => setPersonBLang(e.target.value)}
              disabled={disabled}
              className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-white border border-theme-sand text-theme-dark font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-theme-terracotta transition cursor-pointer disabled:opacity-60 shadow-2xs"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={`b-${lang.code}`} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Domain Vocabulary / Service Setting */}
        <div className="w-full lg:w-72 bg-theme-surface/90 rounded-2xl p-3.5 border border-theme-sand/80 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Counter Context
            </span>
          </div>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-theme-sand text-theme-dark font-semibold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-terracotta transition cursor-pointer shadow-2xs"
          >
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}

import React from 'react';
import { X, Sparkles, Send, MessageSquare } from 'lucide-react';

export const DOMAIN_PHRASES = {
  general: [
    "Welcome! How may I assist you today?",
    "Please show your identification document.",
    "Please wait for a moment.",
    "Here is your receipt.",
    "Thank you, have a pleasant day!",
    "Where do I need to go next?"
  ],
  railway: [
    "What is your travel destination?",
    "Platform number 2 is down the escalators on the right.",
    "Your ticket reservation is confirmed.",
    "The train is running on schedule.",
    "I need to cancel my ticket please.",
    "What time does the express train arrive?"
  ],
  medical: [
    "Please take a seat. What symptoms are you experiencing?",
    "The doctor will examine you shortly.",
    "Here is your prescription for the dispensary.",
    "Take this medication twice daily after meals.",
    "I have had a high fever since yesterday.",
    "Where is the emergency pharmacy?"
  ],
  public_service: [
    "Please present your token slip.",
    "Please sign at the bottom of the form.",
    "Your certificate will be ready in 3 working days.",
    "Your application has been registered successfully.",
    "I have come for document verification.",
    "Which supporting documents are required?"
  ]
};

export default function QuickPhrasesModal({
  isOpen,
  onClose,
  domain = 'general',
  activeSpeaker = 'person_a',
  onSelectPhrase
}) {
  if (!isOpen) return null;

  const phrases = DOMAIN_PHRASES[domain] || DOMAIN_PHRASES.general;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#0D1322] border border-white/10 rounded-2xl shadow-2xl p-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-white text-base">Quick Response Phrases</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2 mb-4">
          Click any phrase to instantly translate and broadcast speech as <strong className="text-sky-300 font-semibold">{activeSpeaker === 'person_a' ? 'Operator' : 'Visitor'}</strong>.
        </p>

        <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
          {phrases.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelectPhrase(phrase, activeSpeaker);
                onClose();
              }}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/30 text-left text-sm text-slate-200 hover:text-white transition group"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-sky-400 flex-shrink-0" />
                <span>{phrase}</span>
              </div>
              <Send className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { MOCK_CHATBOT_STARTERS } from '../../api/mockData';
import { Sparkles } from 'lucide-react';

export const SuggestedPrompts = ({ onSelectPrompt }) => {
  return (
    <div className="p-3 bg-slate-950/60 border-t border-slate-800 space-y-2">
      <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>Suggested Intelligence Questions:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {MOCK_CHATBOT_STARTERS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

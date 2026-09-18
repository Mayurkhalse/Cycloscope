import React from 'react';
import { MOCK_CHATBOT_STARTERS } from '../../api/mockData';
import { Sparkles } from 'lucide-react';

export const SuggestedPrompts = ({ onSelectPrompt }) => {
  return (
    <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-ocean-600" />
        <span>Suggested Intelligence Questions:</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {MOCK_CHATBOT_STARTERS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-ocean-50 text-slate-700 hover:text-ocean-800 border border-slate-200 transition font-medium shadow-xs"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

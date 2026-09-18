import React from 'react';
import { Bot, User, AlertCircle, FileText } from 'lucide-react';

export const ChatMessageBubble = ({ message }) => {
  const isAssistant = message.sender === 'assistant';

  return (
    <div className={`flex gap-3 text-xs ${isAssistant ? 'items-start' : 'items-end flex-row-reverse'}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isAssistant ? 'bg-ocean-100 text-ocean-700 border border-ocean-200 shadow-xs' : 'bg-slate-700 text-white shadow-xs'
        }`}
      >
        {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      <div className={`max-w-[85%] space-y-1.5`}>
        <div
          className={`p-3.5 rounded-2xl ${
            isAssistant
              ? 'bg-slate-50 text-slate-800 border border-slate-200/90 rounded-tl-none shadow-xs font-medium'
              : 'bg-ocean-600 text-white rounded-tr-none shadow-sm font-semibold'
          }`}
        >
          <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>

          {/* Citations if available */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <FileText className="w-3 h-3 text-ocean-600" />
              <span>Sources:</span>
              {message.citations.map((c, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-xs">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Mandatory AI Attribution & Verification Badge */}
        {isAssistant && message.isAiGenerated && (
          <div className="flex items-center gap-1 text-[10px] text-amber-700 font-bold px-1">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <span>AI-generated, verify with IMD</span>
          </div>
        )}
      </div>
    </div>
  );
};

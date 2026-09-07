import React from 'react';
import { Bot, User, AlertCircle, FileText } from 'lucide-react';

export const ChatMessageBubble = ({ message }) => {
  const isAssistant = message.sender === 'assistant';

  return (
    <div className={`flex gap-3 text-xs ${isAssistant ? 'items-start' : 'items-end flex-row-reverse'}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isAssistant ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-700 text-slate-200'
        }`}
      >
        {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      <div className={`max-w-[85%] space-y-2`}>
        <div
          className={`p-3.5 rounded-2xl ${
            isAssistant
              ? 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-md'
              : 'bg-cyan-600 text-white rounded-tr-none shadow-md'
          }`}
        >
          <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>

          {/* Citations if available */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
              <FileText className="w-3 h-3 text-cyan-400" />
              <span>Sources:</span>
              {message.citations.map((c, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Mandatory AI Attribution & Verification Badge */}
        {isAssistant && message.isAiGenerated && (
          <div className="flex items-center gap-1 text-[10px] text-amber-400 font-medium px-1">
            <AlertCircle className="w-3 h-3" />
            <span>AI-generated, verify with IMD</span>
          </div>
        )}
      </div>
    </div>
  );
};

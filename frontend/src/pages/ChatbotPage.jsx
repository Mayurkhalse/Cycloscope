import React, { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../hooks/useChatbot';
import { useActiveSystems } from '../hooks/useActiveSystems';
import { ChatMessageBubble } from '../components/chatbot/ChatMessageBubble';
import { SuggestedPrompts } from '../components/chatbot/SuggestedPrompts';
import { MessageSquare, Send, Bot, Trash2, Sparkles, ShieldAlert, Compass, RefreshCw, Zap } from 'lucide-react';

export const ChatbotPage = () => {
  const { messages, isLoading, sendMessage, clearChat } = useChatbot();
  const { systems } = useActiveSystems();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-8.5rem)] flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-ocean-600 text-white flex items-center justify-center shadow-md shadow-ocean-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <span>Cyclone Intelligence Assistant</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-ocean-50 text-ocean-700 border border-ocean-200 font-bold font-mono">
              RAG + LLM
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Ask real-time questions about North Indian Ocean cyclone tracks, intensity forecasts, rapid intensification risks, and climatology comparisons.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 transition shadow-xs"
            title="Reset Chat Session"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Session</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface Layout (Sidebar + Chat Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Left Side: Active Storm Context & Knowledge Cards */}
        <div className="hidden lg:flex flex-col gap-4 overflow-y-auto">
          {/* Active Storms Context Pill Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card space-y-3">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-ocean-600" />
              <span>Current Synoptic Context</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              The assistant dynamically queries the live status of tracked systems:
            </p>
            <div className="space-y-2">
              {systems.map((s) => (
                <button
                  key={s.id}
                  onClick={() => sendMessage(`Provide current status, estimated wind speed, and projected path for Cyclone ${s.name}.`)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-ocean-50/70 border border-slate-200/80 transition flex items-center justify-between group"
                >
                  <div>
                    <div className="font-extrabold text-xs text-slate-900 group-hover:text-ocean-700">
                      {s.name} ({s.category})
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">{s.basin}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {s.riskLevel}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Intelligence Capabilities */}
          <div className="bg-ocean-50/60 p-4 rounded-2xl border border-ocean-100 shadow-xs space-y-2.5">
            <h4 className="font-bold text-xs text-ocean-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Available Queries</span>
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
              <li className="flex items-start gap-1.5">
                <span className="text-ocean-600 font-bold">•</span>
                <span>Track & Landfall ETA predictions</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-ocean-600 font-bold">•</span>
                <span>Rapid Intensification (RI) criteria</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-ocean-600 font-bold">•</span>
                <span>Historical comparison (e.g. vs Fani / Amphan)</span>
              </li>
            </ul>
          </div>

          {/* Disclaimer Warning */}
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1 font-medium">
            <div className="flex items-center gap-1 font-bold text-amber-800">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Mandatory Safety Notice</span>
            </div>
            <p>
              AI responses are for decision support. Cross-verify all evacuation actions with IMD official bulletins.
            </p>
          </div>
        </div>

        {/* Right Side: Conversational Message Thread + Input */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-card flex flex-col h-full overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2.5 text-xs text-ocean-700 p-3 bg-ocean-50 border border-ocean-200/80 rounded-2xl w-fit animate-pulse font-semibold">
                <Bot className="w-4 h-4 text-ocean-600" />
                <span>Searching RAG knowledge index & generating analysis...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Starter Prompts */}
          <SuggestedPrompts onSelectPrompt={(text) => sendMessage(text)} />

          {/* Input Form Bar */}
          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
            <input
              type="text"
              placeholder="Ask about storm intensity, track uncertainty, landfall risks..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-ocean-500 focus:bg-white shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-5 py-3 bg-ocean-600 hover:bg-ocean-700 disabled:opacity-50 text-white font-extrabold rounded-xl transition flex items-center gap-2 text-xs sm:text-sm shadow-md shadow-ocean-600/20 shrink-0"
            >
              <span>Ask AI</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

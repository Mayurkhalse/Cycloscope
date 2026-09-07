import React, { useState, useRef, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useChatbot } from '../../hooks/useChatbot';
import { ChatMessageBubble } from './ChatMessageBubble';
import { SuggestedPrompts } from './SuggestedPrompts';
import { MessageSquare, X, Send, Bot, Trash2 } from 'lucide-react';

export const ChatWidget = () => {
  const { isChatOpen, closeChat, toggleChat } = useUIStore();
  const { messages, isLoading, sendMessage, clearChat } = useChatbot();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom Right */}
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-5 right-5 z-50 p-4 bg-gradient-to-tr from-cyan-600 to-cyan-400 text-slate-950 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center border-2 border-white/20 group"
          title="Open RAG AI Assistant"
        >
          <MessageSquare className="w-6 h-6 text-slate-950 fill-slate-950" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-950 animate-pulse" />
        </button>
      )}

      {/* Floating Expandable Panel / Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-50 w-full sm:w-96 h-[550px] max-h-[90vh] bg-ocean-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl transition-all">
          {/* Panel Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  Cyclone Intelligence Assistant
                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-cyan-400 rounded font-mono">RAG</span>
                </h3>
                <p className="text-[10px] text-slate-400">Ask about tracks, risks, or comparisons</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded transition"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={closeChat}
                className="p-1.5 text-slate-400 hover:text-white rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-cyan-400 p-2 bg-slate-950/40 rounded-lg animate-pulse">
                <Bot className="w-4 h-4" />
                <span>Searching RAG knowledge index...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Starter Prompts */}
          <SuggestedPrompts onSelectPrompt={(text) => sendMessage(text)} />

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask cyclone question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition shadow-md shadow-cyan-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

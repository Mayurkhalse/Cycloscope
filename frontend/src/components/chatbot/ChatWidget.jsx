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
          className="fixed bottom-5 right-5 z-50 p-4 bg-gradient-to-tr from-ocean-600 to-ocean-500 text-white rounded-full shadow-elevated hover:scale-110 transition-transform duration-300 flex items-center justify-center border-2 border-white group"
          title="Open RAG AI Assistant"
        >
          <MessageSquare className="w-6 h-6 text-white fill-white" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Floating Expandable Panel / Drawer */}
      {isChatOpen && (
        <div className="fixed bottom-0 right-0 sm:bottom-5 sm:right-5 z-50 w-full sm:w-96 h-[550px] max-h-[90vh] bg-white border border-slate-200/90 rounded-t-2xl sm:rounded-2xl shadow-panel flex flex-col overflow-hidden backdrop-blur-xl transition-all">
          {/* Panel Header */}
          <div className="p-4 bg-ocean-50 border-b border-ocean-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-ocean-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  Cyclone Intelligence Assistant
                  <span className="text-[10px] px-1.5 py-0.2 bg-ocean-100 text-ocean-800 rounded font-mono font-bold">RAG</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">Ask about tracks, risks, or comparisons</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={closeChat}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white">
            {messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-ocean-700 p-2.5 bg-ocean-50 rounded-xl animate-pulse font-medium">
                <Bot className="w-4 h-4" />
                <span>Searching RAG knowledge index...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Starter Prompts */}
          <SuggestedPrompts onSelectPrompt={(text) => sendMessage(text)} />

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask cyclone question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-ocean-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 bg-ocean-600 hover:bg-ocean-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-md shadow-ocean-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

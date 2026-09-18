import { useState } from 'react';
import { sendChatMessage, clearRemoteChatSession } from '../api/chatbot.api';

export const useChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hello! I am your North Indian Ocean Cyclone Assistant. Ask me about active storm trajectories, intensity trends, or historical comparisons.',
      timestamp: new Date().toISOString(),
      isAiGenerated: true,
      requiresImdVerification: false,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (promptText) => {
    if (!promptText.trim() || isLoading) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage(promptText, messages);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: 'Sorry, I encountered an error connecting to the intelligence assistant. Please try again.',
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    clearRemoteChatSession();
    setMessages([
      {
        id: 'welcome-1',
        sender: 'assistant',
        text: 'Chat history cleared. How can I assist you with cyclone decision support?',
        timestamp: new Date().toISOString(),
        isAiGenerated: true,
      },
    ]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
  };
};

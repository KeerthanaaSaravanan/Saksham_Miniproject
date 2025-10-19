'use client';

import React, { createContext, useState, useContext } from 'react';
import { Chatbot } from './chatbot';

interface ChatbotContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}

export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ChatbotContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
      <Chatbot />
    </ChatbotContext.Provider>
  );
}

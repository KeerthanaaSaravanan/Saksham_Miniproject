'use client';

import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatbot } from './chatbot-provider';

export function ChatbotToggle() {
  const { isOpen, setIsOpen } = useChatbot();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        size="icon"
        className="rounded-full h-14 w-14 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}

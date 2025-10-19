'use client';

import { MessageCircle, X, Accessibility } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChatbot } from './chatbot-provider';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ChatbotToggle() {
  const { isOpen, setIsOpen } = useChatbot();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full h-12 w-12 shadow-lg"
              asChild
            >
              <Link href="/settings/accessibility">
                <Accessibility className="h-6 w-6" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Accessibility Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

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

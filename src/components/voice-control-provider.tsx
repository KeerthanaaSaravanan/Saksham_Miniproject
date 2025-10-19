'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getChatbotResponse } from '@/lib/actions/chatbot';

interface VoiceControlContextType {
  isListening: boolean;
  toggleListening: () => void;
}

const VoiceControlContext = createContext<VoiceControlContextType | undefined>(undefined);

export function useVoiceControl() {
  const context = useContext(VoiceControlContext);
  if (context === undefined) {
    throw new Error('useVoiceControl must be used within a VoiceControlProvider');
  }
  return context;
}

export function VoiceControlProvider({ children }: { children: ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  },[router]);

  const processCommand = useCallback(async (command: string) => {
    const lowerCaseCommand = command.toLowerCase();
     if (lowerCaseCommand.includes('navigate to') || lowerCaseCommand.includes('go to') || lowerCaseCommand.includes('open')) {
        let path = '';
        if(lowerCaseCommand.includes('dashboard')) path = '/dashboard';
        else if (lowerCaseCommand.includes('assessment')) path = '/assessment';
        else if (lowerCaseCommand.includes('practice')) path = '/practice';
        else if (lowerCaseCommand.includes('results')) path = '/results';
        else if (lowerCaseCommand.includes('profile')) path = '/settings/profile';
        else if (lowerCaseCommand.includes('accessibility')) path = '/settings/accessibility';
        else if (lowerCaseCommand.includes('help')) path = '/help';
        else if (lowerCaseCommand.includes('admin')) path = '/admin/dashboard';
        
        if (path) {
            handleNavigation(path);
            toast({ title: 'Navigating', description: `Going to ${path}` });
        } else {
             toast({ variant: 'destructive', title: 'Unknown Page', description: `Could not find page for command: "${command}"` });
        }
    } else {
         const res = await getChatbotResponse({
            userMessage: command,
            modality: 'voice',
        });
        if ('response' in res && res.modality === 'voice') {
            const audio = new Audio(res.response);
            audio.play();
        }
    }
  }, [handleNavigation, toast]);


  const startListener = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: 'destructive', title: 'Unsupported', description: "Your browser doesn't support speech recognition."});
      setIsListening(false);
      return;
    }

    if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const command = lastResult[0].transcript.trim();
        toast({ title: 'Command Detected', description: command });
        processCommand(command);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // Just ignore and it will auto-restart if continuous is true
      } else {
        toast({ variant: 'destructive', title: 'Voice Error', description: event.error });
      }
    };
    
    recognition.onend = () => {
        if(isListening) {
             setTimeout(() => recognition.start(), 250);
        }
    }

    recognition.start();
    recognitionRef.current = recognition;
    toast({ title: 'Voice Control Enabled', description: 'Listening for commands...' });

  }, [toast, processCommand, isListening]);

  const stopListener = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      toast({ title: 'Voice Control Disabled' });
    }
  };

  const toggleListening = () => {
    setIsListening(prev => !prev);
  };

  useEffect(() => {
      if(isListening) {
          startListener();
      } else {
          stopListener();
      }
      
      return () => {
          if (recognitionRef.current) {
              recognitionRef.current.stop();
          }
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  return (
    <VoiceControlContext.Provider value={{ isListening, toggleListening }}>
      {children}
    </VoiceControlContext.Provider>
  );
}

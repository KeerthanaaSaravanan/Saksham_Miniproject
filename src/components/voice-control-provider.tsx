'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getChatbotResponse, getTTS } from '@/lib/actions/chatbot';
import { usePathname } from 'next/navigation';

interface VoiceControlContextType {
  isListening: boolean;
  toggleListening: () => void;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const speak = useCallback(async (text: string) => {
    setIsLoading(true);
    try {
      const result = await getTTS(text);
      if ('media' in result && audioRef.current) {
        audioRef.current.src = result.media;
        return new Promise<void>((resolve) => {
          audioRef.current!.onended = () => {
            setIsLoading(false);
            resolve();
          };
          audioRef.current!.play().catch(e => {
            console.error("Audio play failed:", e);
            setIsLoading(false);
            resolve();
          });
        });
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsLoading(false);
    }
  }, []);

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const processCommand = useCallback(async (command: string) => {
    const lowerCaseCommand = command.toLowerCase();
    
    if (lowerCaseCommand.includes('yes')) {
        setIsListening(true);
        // This state change will trigger the useEffect
        return;
    }
    if (lowerCaseCommand.includes('no')) {
        setIsListening(false);
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        return;
    }

    if (!isListening) return;

    if (lowerCaseCommand.includes('navigate to') || lowerCaseCommand.includes('go to') || lowerCaseCommand.includes('open')) {
      let path = '';
      if(lowerCaseCommand.includes('dashboard')) path = '/dashboard';
      else if (lowerCaseCommand.includes('assessment') || lowerCaseCommand.includes('my exams')) path = '/assessment';
      else if (lowerCaseCommand.includes('practice')) path = '/practice';
      else if (lowerCaseCommand.includes('results')) path = '/results';
      else if (lowerCaseCommand.includes('profile')) path = '/settings/profile';
      else if (lowerCaseCommand.includes('accessibility')) path = '/settings/accessibility';
      else if (lowerCaseCommand.includes('help')) path = '/help';
      else if (lowerCaseCommand.includes('admin')) path = '/admin/dashboard';
      
      if (path) {
          handleNavigation(path);
          toast({ title: 'Navigating', description: `Going to ${path}` });
          await speak(`Navigating to ${path.split('/').pop() || 'the page'}.`);
      } else {
           const failedPage = lowerCaseCommand.replace(/navigate to|go to|open/g, '').trim();
           toast({ variant: 'destructive', title: 'Unknown Page', description: `Could not find page: "${failedPage}"` });
           await speak(`Sorry, I can't find a page called ${failedPage}.`);
      }
    } else {
        const res = await getChatbotResponse({
          userMessage: command,
          modality: 'voice',
        });
        if ('response' in res && res.modality === 'voice') {
          await speak(res.response);
        }
    }
  }, [handleNavigation, toast, speak, isListening]);

  const startListener = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if(isListening) toast({ variant: 'destructive', title: 'Unsupported', description: "Your browser doesn't support speech recognition."});
      setIsListening(false);
      return;
    }

    if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Listen continuously
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
        // Ignore and let it restart
      } else if (event.error !== 'aborted') { // Don't show toast for manual stop
        toast({ variant: 'destructive', title: 'Voice Error', description: event.error });
      }
    };
    
    recognition.onend = () => {
        // If listening is still supposed to be active, restart it.
        // This is a workaround for some browsers stopping recognition after a while.
        if (isListening && recognitionRef.current === recognition) {
             try {
                recognition.start();
             } catch(e) {
                console.error("Could not restart recognition", e);
             }
        }
    }

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch(e) {
      console.error("Could not start recognition", e);
      setIsListening(false);
    }

  }, [toast, processCommand, isListening]);

  const toggleListening = useCallback(async () => {
    setIsListening(prev => {
        const newListeningState = !prev;
        if (newListeningState && pathname !== '/') {
            const pageName = pathname.split('/').pop()?.replace('-', ' ') || 'the current page';
            speak(`Voice control is enabled. You are on the ${pageName} page. What would you like to do?`);
        }
        return newListeningState;
    });
  }, [pathname, speak]);

  useEffect(() => {
    // Special handling for the very first load on the login page
    if (pathname === '/') {
        const WELCOME_KEY = 'saksham_welcome_spoken';
        const hasBeenWelcomed = sessionStorage.getItem(WELCOME_KEY);

        if (!hasBeenWelcomed) {
            speak("Welcome to Saksham! Would you like me to guide you through login using voice commands? Please say 'yes' to begin or 'no' to continue manually.")
            .then(() => {
                 startListener();
            });
            sessionStorage.setItem(WELCOME_KEY, 'true');
        }
    }

    // General logic for toggling listening state
    if (isListening) {
        startListener();
        if(pathname !== '/') toast({ title: 'Voice Control Enabled', description: 'Listening for commands...' });
    } else {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null; // prevent restart on manual stop
            recognitionRef.current.stop();
            recognitionRef.current = null;
            if(pathname !== '/') toast({ title: 'Voice Control Disabled' });
        }
    }
      
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, pathname]);

  return (
    <VoiceControlContext.Provider value={{ isListening, toggleListening, isLoading }}>
      {children}
      <audio ref={audioRef} className="hidden" />
    </VoiceControlContext.Provider>
  );
}

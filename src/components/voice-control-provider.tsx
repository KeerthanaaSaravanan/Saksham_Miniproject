
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { parseVoiceCommand } from "@/lib/actions/chatbot";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { usePathname } from 'next/navigation';
import { useExamMode } from '@/hooks/use-exam-mode';
import { useAccessibilityPanel } from './accessibility/accessibility-panel-provider';
import type { ParseVoiceCommandOutput } from '@/ai/flows/parse-voice-command';

interface VoiceControlContextType {
  isListening: boolean;
  toggleListening: () => void;
  isLoading: boolean;
  processLoginCommand: (command: string) => Promise<boolean>;
}

const VoiceControlContext = createContext<VoiceControlContextType | undefined>(undefined);

export function useVoiceControl() {
  const context = useContext(VoiceControlContext);
  if (context === undefined) {
    throw new Error('useVoiceControl must be used within a VoiceControlProvider');
  }
  return context;
}

const getPagePrompt = (pathname: string): string => {
    const pageName = pathname.split('/').pop()?.replace('-', ' ') || 'current';

    let prompt = `You are on the ${pageName} page. `;

    if (pathname.includes('/dashboard')) {
        prompt += "You can say, 'open my exams' to view assessments, or 'open practice' to generate a practice test.";
    } else if (pathname.includes('/assessment')) {
        prompt += "This is the 'My Exams' page. You can say 'start exam' followed by the exam name.";
    } else if (pathname.includes('/practice')) {
        prompt += "This is the practice zone. You can say 'generate a new test' or 'review my history'.";
    } else if (pathname.includes('/results')) {
        prompt += "This is the results page. You can say 'read my results' to hear a summary.";
    } else if (pathname.includes('/settings')) {
        prompt += "You are in settings. You can say 'go to profile' or 'go to accessibility'.";
    } else if (pathname.includes('/help')) {
        prompt += "This is the help page. You can ask me a question about any feature.";
    } else {
        prompt += "You can say 'help' to know the available commands.";
    }
    return prompt;
}


export function VoiceControlProvider({ children }: { children: ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [loginStep, setLoginStep] = useState<'idle' | 'ask-mode' | 'ask-email' | 'confirm-email' | 'ask-password' | 'confirm-password' | 'submitting'>('idle');
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });
  const isSpeakingRef = useRef(false);
  const { isExamMode } = useExamMode();
  const { userProfile } = useAccessibilityPanel();


  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    if (isSpeakingRef.current) {
        console.log("Already speaking, skipping new request.");
        onEnd?.();
        return;
    }
    setIsLoading(true);
    isSpeakingRef.current = true;
    try {
      const result = await textToSpeech(text);
      if ('media' in result && audioRef.current) {
        audioRef.current.src = result.media;
        
        const playPromise = audioRef.current.play();
        if(playPromise !== undefined) {
            playPromise.catch(e => {
                console.error("Audio play failed:", e);
                isSpeakingRef.current = false;
                setIsLoading(false);
                onEnd?.();
            });
        }
        
        audioRef.current.onended = () => {
          isSpeakingRef.current = false;
          setIsLoading(false);
          onEnd?.();
        };

      } else {
        isSpeakingRef.current = false;
        setIsLoading(false);
        onEnd?.();
      }
    } catch (error: any) {
      console.error("TTS Error:", error);
      isSpeakingRef.current = false;
      setIsLoading(false);
      onEnd?.();
    }
  }, []);

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);


  const processLoginCommand = useCallback(async (command: string): Promise<boolean> => {
    const lowerCaseCommand = command.toLowerCase().replace(/\./g, '').replace(/\s/g, '');

    switch(loginStep) {
      case 'ask-mode':
         if (lowerCaseCommand.includes('voice')) {
            await speak("Voice guidance enabled. Let's start with your email address. Please say your email.", () => {
                setLoginStep('ask-email');
            });
         } else if (lowerCaseCommand.includes('manual')) {
             await speak("Manual mode selected. You can reactivate voice control at any time from the sidebar.", () => {
                 setLoginStep('idle');
                 setIsListening(false);
             });
         } else {
             await speak("I didn't catch that. Please say 'voice guidance' or 'manual control'.");
         }
         return true;

      case 'ask-email':
        const capturedEmail = command;
        setLoginCredentials(prev => ({...prev, email: capturedEmail }));
        window.dispatchEvent(new CustomEvent('voice-input', { detail: { field: 'email', value: capturedEmail } }));
        await speak(`I heard ${capturedEmail.split('').join(' ')}. Is that correct?`, () => {
            setLoginStep('confirm-email');
        });
        return true;

      case 'confirm-email':
        if (lowerCaseCommand.includes('yes') || lowerCaseCommand.includes('correct')) {
          await speak("Great. Now, please say your password.", () => {
              setLoginStep('ask-password');
          });
        } else {
          setLoginCredentials(prev => ({...prev, email: '' }));
          window.dispatchEvent(new CustomEvent('voice-input', { detail: { field: 'email', value: '' } }));
          await speak("My mistake. Let's try again. What is your email address?", () => {
              setLoginStep('ask-email');
          });
        }
        return true;

      case 'ask-password':
        const capturedPassword = command;
        setLoginCredentials(prev => ({...prev, password: capturedPassword }));
        window.dispatchEvent(new CustomEvent('voice-input', { detail: { field: 'password', value: capturedPassword } }));
        await speak(`Password captured. It has ${capturedPassword.length} characters. Should I proceed with login?`, () => {
            setLoginStep('confirm-password');
        });
        return true;

      case 'confirm-password':
        if (lowerCaseCommand.includes('yes') || lowerCaseCommand.includes('proceed') || lowerCaseCommand.includes('login')) {
            await speak("Attempting to log you in now.", () => {
              setLoginStep('submitting');
              window.dispatchEvent(new CustomEvent('voice-submit'));
            });
        } else {
            setLoginCredentials(prev => ({...prev, password: '' }));
            window.dispatchEvent(new CustomEvent('voice-input', { detail: { field: 'password', value: '' } }));
            await speak("Okay, let's try the password again. Please say your password.", () => {
                setLoginStep('ask-password');
            });
        }
        return true;

      default:
        return false;
    }
  }, [loginStep, speak]);
  

  const processCommand = useCallback(async (command: string) => {
    
    // Give login process priority
    if(pathname === '/' && loginStep !== 'idle' && loginStep !== 'submitting') {
        const loginHandled = await processLoginCommand(command);
        if(loginHandled) return;
    }

    if(isExamMode) {
      // In exam mode, dispatch events for the exam layout to handle.
      const event = new CustomEvent('voiceCommand', { detail: command });
      window.dispatchEvent(event);
      return;
    }


    if (command.toLowerCase().includes('stop listening')) {
        speak('Voice control disabled.', () => setIsListening(false));
        return;
    }

    const res: ParseVoiceCommandOutput | { error: string } = await parseVoiceCommand({
      transcript: command,
      pageContext: pathname,
    });

    if ('error' in res) {
      toast({ variant: 'destructive', title: 'AI Error', description: res.error });
      await speak(`I had trouble understanding that. Please try again.`);
      return;
    }

    if(res.clarify) {
        await speak(res.tts_text);
        // We'd need more logic here to handle the confirmation (yes/no)
        // For now, we just speak the clarifying question.
        return;
    }
    
    let path = '';
    switch(res.intent) {
        case 'open_dashboard': path = '/dashboard'; break;
        case 'open_exams': path = '/assessment'; break;
        case 'open_practice': path = '/practice'; break;
        case 'open_profile': path = '/settings/profile'; break;
        default: break;
    }

    if (path) {
        handleNavigation(path);
        await speak(res.tts_text);
    } else {
        // Fallback to chatbot-like behavior if no navigation is triggered
        await speak(res.tts_text);
    }

  }, [handleNavigation, toast, speak, processLoginCommand, loginStep, isExamMode, pathname, userProfile]);

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
      if(isSpeakingRef.current) return;
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const command = lastResult[0].transcript.trim();
        toast({ title: 'Command Detected', description: command });
        processCommand(command);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'network') {
        // Ignore and let it restart
      } else if (event.error !== 'aborted') { // Don't show toast for manual stop
        console.error("Speech recognition error:", event.error);
        toast({ variant: 'destructive', title: 'Voice Error', description: event.error });
      }
    };
    
    recognition.onend = () => {
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

  const toggleListening = useCallback(() => {
    setIsListening(prev => !prev);
  }, []);
  
  useEffect(() => {
    if (isListening) {
      startListener();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent automatic restart
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
       if (audioRef.current) {
            audioRef.current.pause();
            isSpeakingRef.current = false;
       }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [isListening, startListener]);

  // Logic to initiate voice guidance on app load
  useEffect(() => {
    const isFirstVisit = !sessionStorage.getItem('visited');
    if (pathname === '/' && isFirstVisit) {
      sessionStorage.setItem('visited', 'true');
      setIsListening(true);
      setLoginStep('ask-mode');
      speak("Welcome to Saksham. To begin, would you like to use voice guidance or manual control?");
    }
  }, [pathname, speak]);

  return (
    <VoiceControlContext.Provider value={{ isListening, toggleListening, isLoading, processLoginCommand }}>
      {children}
      <audio ref={audioRef} className="hidden" />
    </VoiceControlContext.Provider>
  );
}

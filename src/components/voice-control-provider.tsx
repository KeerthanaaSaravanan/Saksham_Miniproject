
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getChatbotResponse, getTTS } from '@/lib/actions/chatbot';
import { usePathname } from 'next/navigation';
import { useExamMode } from '@/hooks/use-exam-mode';

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
        prompt += "This is the 'My Exams' page. You can say the name of an exam to start it.";
    } else if (pathname.includes('/practice')) {
        prompt += "This is the practice zone. You can generate a new test or review your history.";
    } else if (pathname.includes('/results')) {
        prompt += "This is the results page, showing your official graded exams.";
    } else if (pathname.includes('/settings')) {
        prompt += "You are in settings. You can say 'go to profile' or 'go to accessibility'.";
    } else if (pathname.includes('/help')) {
        prompt += "This is the help and guidance page. You can ask me a question about any feature.";
    } else {
        prompt += "What would you like to do?";
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
  const [loginStep, setLoginStep] = useState<'idle' | 'ask-email' | 'confirm-email' | 'ask-password' | 'confirm-password' | 'submitting'>('idle');
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });
  const [initialWelcomeDone, setInitialWelcomeDone] = useState(false);
  const isSpeakingRef = useRef(false);
  const { isExamMode } = useExamMode();


  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    if (isSpeakingRef.current) return;
    setIsLoading(true);
    isSpeakingRef.current = true;
    try {
      const result = await getTTS(text);
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
    } catch (error) {
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
      case 'ask-email':
        setLoginCredentials(prev => ({ ...prev, email: lowerCaseCommand }));
        await speak(`I heard ${lowerCaseCommand.split('').join(' ')}. Is that correct?`);
        setLoginStep('confirm-email');
        return true;
      case 'confirm-email':
        if (lowerCaseCommand === 'yes') {
          await speak("Great. Now, please say your password.");
          setLoginStep('ask-password');
        } else {
          await speak("My mistake. Let's try again. What is your email address?");
          setLoginStep('ask-email');
        }
        return true;
      case 'ask-password':
        setLoginCredentials(prev => ({ ...prev, password: command })); // Keep case for password
        await speak(`I have your password. It has ${command.length} characters. Should I proceed with login?`);
        setLoginStep('confirm-password');
        return true;
      case 'confirm-password':
        if (lowerCaseCommand === 'yes') {
            setLoginStep('submitting');
            // This is a special case, we're not returning true because we want the form to handle it.
            return false;
        } else {
            await speak("Okay, let's try the password again. Please say your password.");
            setLoginStep('ask-password');
        }
        return true;
      default:
        return false;
    }
  }, [loginStep, speak]);
  

  const processCommand = useCallback(async (command: string) => {
    
    // Give login process priority
    if(loginStep !== 'idle' && loginStep !== 'submitting') {
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
        setIsListening(false);
        speak('Voice control disabled.');
        return;
    }

    const lowerCaseCommand = command.toLowerCase();

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
        // Fallback to chatbot
        const res = await getChatbotResponse({
          userMessage: command,
          modality: 'voice',
        });
        if ('response' in res && res.modality === 'voice') {
          await speak(res.response);
        }
    }
  }, [handleNavigation, toast, speak, processLoginCommand, loginStep, isExamMode]);

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
      console.error("Speech recognition error:", event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // Ignore and let it restart
      } else if (event.error !== 'aborted') { // Don't show toast for manual stop
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

  const toggleListening = () => {
    setIsListening(prev => !prev);
  };
  
  // This effect manages starting/stopping the listener and speaking context-aware prompts.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, startListener]);


  const initialPrompt = useCallback(async () => {
    if (pathname === '/' && !initialWelcomeDone) {
      setInitialWelcomeDone(true);
      const WELCOME_KEY = 'saksham_welcome_spoken';
      const hasBeenWelcomed = sessionStorage.getItem(WELCOME_KEY);
      
      if (!hasBeenWelcomed) {
        await speak("Welcome to Saksham! Would you like me to guide you through login using voice commands? Please say 'yes' to begin or 'no' to continue manually.", () => {
            setIsListening(true);
        });
        sessionStorage.setItem(WELCOME_KEY, 'true');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, initialWelcomeDone, speak]);

  useEffect(() => {
    const timer = setTimeout(() => {
        initialPrompt();
    }, 1000);
    return () => clearTimeout(timer);
  }, [initialPrompt]);

   const handleInitialYesNo = useCallback(async (command: string) => {
        if(pathname === '/' && loginStep === 'idle') {
            const lower = command.toLowerCase();
            if (lower.includes('yes')) {
                await speak("Voice control is enabled. Let's start with your email address. Please say your email.", () => {
                    setLoginStep('ask-email');
                });
            } else if (lower.includes('no')) {
                setIsListening(false);
            }
        }
    }, [pathname, loginStep, speak]);

    useEffect(() => {
        const handleCommand = (event: any) => {
             if (pathname === '/' && loginStep === 'idle') {
                const transcript = event.results[event.results.length - 1][0].transcript.trim();
                handleInitialYesNo(transcript);
             }
        };

        if(recognitionRef.current && pathname === '/' && loginStep === 'idle') {
            recognitionRef.current.addEventListener('result', handleCommand);
        }

        return () => {
            if(recognitionRef.current) {
                recognitionRef.current.removeEventListener('result', handleCommand);
            }
        }
    }, [pathname, loginStep, handleInitialYesNo]);


  return (
    <VoiceControlContext.Provider value={{ isListening, toggleListening, isLoading, processLoginCommand }}>
      {children}
      <audio ref={audioRef} className="hidden" />
    </VoiceControlContext.Provider>
  );
}

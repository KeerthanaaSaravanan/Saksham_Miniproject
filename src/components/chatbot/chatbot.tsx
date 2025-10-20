
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Bot, Loader2, Mic, MicOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatbot } from './chatbot-provider';
import { getChatbotResponse } from '@/lib/actions/chatbot';
import { useRouter } from 'next/navigation';
import { useAccessibilityPanel } from '../accessibility/accessibility-panel-provider';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  isAudio?: boolean;
};

export function Chatbot() {
  const { isOpen, setIsOpen } = useChatbot();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Saksham's AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  const { userProfile } = useAccessibilityPanel();
  const accessibility = userProfile?.accessibility_profile || {};
  const isVoiceModality = accessibility.speechToText || accessibility.voiceCommandNavigation || accessibility.textToSpeech;
  const isTextOnlyChat = accessibility.chatbotHelp;


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  },[router]);

  const processCommand = useCallback((command: string) => {
    const lowerCaseCommand = command.toLowerCase();
    if (lowerCaseCommand.includes('navigate to') || lowerCaseCommand.includes('go to') || lowerCaseCommand.includes('open')) {
        if(lowerCaseCommand.includes('dashboard')) {
            handleNavigation('/dashboard');
        } else if (lowerCaseCommand.includes('assessment')) {
            handleNavigation('/assessment');
        } else if (lowerCaseCommand.includes('profile')) {
            handleNavigation('/profiling');
        } else if (lowerCaseCommand.includes('admin')) {
            handleNavigation('/admin/dashboard');
        }
    }
  }, [handleNavigation]);

  const handleSubmit = async (e: React.FormEvent, voiceInput?: string) => {
    e.preventDefault();
    const messageContent = voiceInput || input;
    if (!messageContent.trim()) return;

    processCommand(messageContent);

    const userMessage: Message = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const pastMessages = messages.slice(-5); // Send last 5 messages for context
    const modality = (voiceInput || isVoiceModality) && !isTextOnlyChat ? 'voice' : 'text';

    const res = await getChatbotResponse({
        userMessage: messageContent,
        modality: modality,
        pastMessages: pastMessages
    });

    setIsLoading(false);

    if ('error' in res) {
        const errorMessage: Message = { role: 'assistant', content: `Error: ${res.error}`};
        setMessages(prev => [...prev, errorMessage]);
    } else {
        const isAudio = res.modality === 'voice';
        const assistantMessage: Message = { role: 'assistant', content: res.response, isAudio };
        setMessages(prev => [...prev, assistantMessage]);
        if(isAudio && audioRef.current) {
            audioRef.current.src = res.response;
            audioRef.current.play();
        }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSubmit(new Event('submit'), transcript);
    };

    recognitionRef.current.start();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
        <CardHeader className="border-b flex flex-row items-center justify-between">
          <CardTitle className="font-headline flex items-center gap-2">
            <Bot /> AI Assistant
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.isAudio ? (
                        <audio controls src={message.content} className="w-full" />
                    ) : (
                        message.content
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback><User size={20} /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className="flex items-start gap-3 justify-start">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20} /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              id="message"
              placeholder="Type or use mic..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <Button type="button" size="icon" onClick={toggleRecording} disabled={isLoading} variant={isRecording ? 'destructive' : 'ghost'}>
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="sr-only">{isRecording ? 'Stop recording' : 'Start recording'}</span>
            </Button>
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}

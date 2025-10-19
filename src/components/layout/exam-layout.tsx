'use client';

import { useState, useMemo, useEffect, useRef }from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Timer } from '@/components/Timer';
import { useProctoring } from '@/hooks/use-proctoring';
import { useToast } from '@/hooks/use-toast';
import type { SelectedExamDetails, AssessmentQuestion } from '@/app/(app)/assessment/[examId]/page';
import { Flag, Loader2, Volume2, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RightSidebar } from './right-sidebar';
import { useExamMode } from '@/hooks/use-exam-mode';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useAccessibilityPanel } from '../accessibility/accessibility-panel-provider';
import { getTTS } from '@/lib/actions/chatbot';

interface ExamLayoutProps {
    exam: SelectedExamDetails;
    onTimeUp: (answers: Record<string, string>) => void;
    isSubmitting: boolean;
}

type AnswerStatus = 'answered' | 'unanswered' | 'review';

export function ExamLayout({ exam, onTimeUp, isSubmitting }: ExamLayoutProps) {
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [reviewFlags, setReviewFlags] = useState<Record<string, boolean>>({});
    const { toast } = useToast();
    const { setIsExamMode } = useExamMode();
    const { userProfile } = useAccessibilityPanel();
    const [isTTSSpeaking, setIsTTSSpeaking] = useState(false);
    const [isSTTRecording, setIsSTTRecording] = useState(false);
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const accessibility = userProfile?.accessibility_profile || {};
    const isTextToSpeechEnabled = accessibility.textToSpeech || accessibility.readAloud;
    const isSpeechToTextEnabled = accessibility.speechToText || accessibility.voiceCommandNavigation;

    useEffect(() => {
        setIsExamMode(true);
        return () => setIsExamMode(false);
    }, [setIsExamMode]);

    const proctoringCallbacks = useMemo(() => ({
        onLeave: () => {
          toast({
            variant: 'destructive',
            title: 'Warning: Left Exam Tab',
            description: 'This is your only warning. Leaving again will automatically submit your exam.',
          });
        },
        onViolationLimitReached: () => {
          toast({
            variant: 'destructive',
            title: 'Exam Automatically Submitted',
            description: 'You have left the exam tab more than once.',
          });
          onTimeUp(answers);
        }
    }), [toast, onTimeUp, answers]);

    useProctoring({
        isActive: true,
        ...proctoringCallbacks
    });

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };
    
    const toggleReviewFlag = (questionId: string) => {
        setReviewFlags(prev => ({...prev, [questionId]: !prev[questionId]}));
    }

    const activeQuestion: AssessmentQuestion = exam.questions[activeQuestionIndex];

     const playTTS = async (text: string) => {
        if (isTTSSpeaking) return;
        setIsTTSSpeaking(true);
        try {
            const result = await getTTS(text);
            if ('media' in result && audioRef.current) {
                audioRef.current.src = result.media;
                audioRef.current.play();
                audioRef.current.onended = () => setIsTTSSpeaking(false);
            } else {
                setIsTTSSpeaking(false);
            }
        } catch (error) {
            console.error("TTS Error:", error);
            setIsTTSSpeaking(false);
        }
    };
    
    const toggleSTT = (questionId: string) => {
        if (isSTTRecording) {
            recognitionRef.current?.stop();
        } else {
            startSTT(questionId);
        }
    };

    const startSTT = (questionId: string) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast({ variant: 'destructive', title: "Unsupported", description: "Your browser doesn't support speech recognition."});
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => setIsSTTRecording(true);
        recognitionRef.current.onend = () => setIsSTTRecording(false);
        recognitionRef.current.onerror = (event: any) => {
            console.error("STT Error:", event.error);
            setIsSTTRecording(false);
        };
        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            handleAnswerChange(questionId, answers[questionId] ? answers[questionId] + ' ' + transcript : transcript);
        };

        recognitionRef.current.start();
    };

    const getQuestionStatus = (index: number): AnswerStatus => {
        const questionId = exam.questions[index].id;
        if(reviewFlags[questionId]) return 'review';
        if(answers[questionId] && answers[questionId].trim() !== '') return 'answered';
        return 'unanswered';
    }

    const renderQuestionInput = (question: AssessmentQuestion) => {
        const questionId = question.id;
        const value = answers[questionId] || '';

        const sttButton = isSpeechToTextEnabled && ['short-answer', 'long-answer', 'fillup'].includes(question.type || '') && (
            <Button
              size="icon"
              variant={isSTTRecording ? 'destructive' : 'outline'}
              onClick={() => toggleSTT(questionId)}
              className="ml-2"
            >
              {isSTTRecording ? <MicOff /> : <Mic />}
            </Button>
        );

        switch (question.type) {
            case 'mcq':
                return (
                    <RadioGroup
                        className="mt-4 space-y-3"
                        value={value}
                        onValueChange={(val) => handleAnswerChange(questionId, val)}
                    >
                        {question.options.filter(opt => opt).map((option, i) => (
                            <div key={i} className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                                <RadioGroupItem value={option} id={`q${activeQuestionIndex}-o${i}`} />
                                <Label htmlFor={`q${activeQuestionIndex}-o${i}`} className="font-normal text-base flex-1 cursor-pointer">
                                    {option}
                                </Label>
                                {isTextToSpeechEnabled && (
                                    <Button size="icon" variant="ghost" onClick={() => playTTS(option)} disabled={isTTSSpeaking}>
                                        <Volume2 className={isTTSSpeaking ? "animate-pulse" : ""} />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </RadioGroup>
                );
            case 'fillup':
            case 'short-answer':
                return (
                    <div className="flex items-center mt-4">
                        <Input 
                            placeholder="Your answer"
                            value={value}
                            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                        />
                        {sttButton}
                    </div>
                );
            case 'long-answer':
                 return (
                    <div className="flex items-start mt-4">
                        <Textarea
                            className="min-h-[150px]"
                            placeholder="Your detailed answer"
                            value={value}
                            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                        />
                        {sttButton}
                    </div>
                );
            default:
                 return (
                     // Default to MCQ if type is missing for backward compatibility
                    <RadioGroup
                        className="mt-4 space-y-3"
                        value={value}
                        onValueChange={(val) => handleAnswerChange(questionId, val)}
                    >
                        {question.options.filter(opt => opt).map((option, i) => (
                            <div key={i} className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                                <RadioGroupItem value={option} id={`q${activeQuestionIndex}-o${i}`} />
                                <Label htmlFor={`q${activeQuestionIndex}-o${i}`} className="font-normal text-base flex-1 cursor-pointer">
                                    {option}
                                </Label>
                                 {isTextToSpeechEnabled && (
                                    <Button size="icon" variant="ghost" onClick={() => playTTS(option)} disabled={isTTSSpeaking}>
                                        <Volume2 className={isTTSSpeaking ? "animate-pulse" : ""} />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </RadioGroup>
                 )
        }
    }
    
    const answeredCount = Object.keys(answers).filter(key => answers[key] && answers[key].trim() !== '').length;
    const reviewedCount = Object.keys(reviewFlags).filter(k => reviewFlags[k]).length;

    return (
        <div className={cn(
            "fixed inset-0 bg-background flex noselect",
            accessibility.dyslexiaFriendlyFont && "font-dyslexic",
            accessibility.highContrast && "dark",
            accessibility.largeText && "text-lg"
        )} onContextMenu={(e) => e.preventDefault()}>
            <audio ref={audioRef} className="hidden" />
            {/* Left Panel: Question Palette */}
            <div className="w-64 border-r bg-card flex flex-col p-4">
                <h3 className="font-bold text-lg mb-1">Questions</h3>
                <p className="text-xs text-muted-foreground mb-4">Navigate between questions.</p>
                <ScrollArea className="flex-1 pr-2">
                    <div className="grid grid-cols-5 gap-2">
                        {exam.questions.map((q, index) => {
                            const status = getQuestionStatus(index);
                            return (
                                <Button
                                    key={q.id}
                                    variant={activeQuestionIndex === index ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setActiveQuestionIndex(index)}
                                    className={cn("h-9 w-9 relative", {
                                        'bg-green-500/20 border-green-500 text-green-700 hover:bg-green-500/30': status === 'answered' && activeQuestionIndex !== index,
                                        'bg-yellow-500/20 border-yellow-500 text-yellow-700 hover:bg-yellow-500/30': status === 'review' && activeQuestionIndex !== index,
                                    })}
                                >
                                    {index + 1}
                                     {status === 'review' && <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-600 fill-yellow-500" />}
                                </Button>
                            );
                        })}
                    </div>
                </ScrollArea>
                <div className="mt-4 text-xs space-y-2 text-muted-foreground">
                   <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500"/> Answered</div> <span>{answeredCount}</span></div>
                   <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-border"/> Unanswered</div> <span>{exam.questions.length - answeredCount}</span></div>
                   <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500"/> Review</div> <span>{reviewedCount}</span></div>
                </div>
            </div>

            {/* Main Panel: Exam Content */}
            <main className="flex-1 flex flex-col md:mr-20">
                <header className="flex justify-between items-center border-b p-4">
                    <div>
                        <h1 className="text-xl font-bold">{exam.title}</h1>
                        <p className="text-sm text-muted-foreground">{exam.subject}</p>
                    </div>
                    {exam.durationMinutes && (
                        <Timer
                            durationInMinutes={exam.durationMinutes}
                            onTimeUp={() => onTimeUp(answers)}
                        />
                    )}
                </header>
                <ScrollArea className="flex-1">
                    <div className="p-8">
                        {activeQuestion && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold">Question {activeQuestionIndex + 1} of {exam.questions.length}</h2>
                                     {isTextToSpeechEnabled && (
                                        <Button size="icon" variant="outline" onClick={() => playTTS(activeQuestion.question)} disabled={isTTSSpeaking}>
                                            <Volume2 className={isTTSSpeaking ? "animate-pulse" : ""} />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xl mb-6">{activeQuestion.question}</p>
                                {renderQuestionInput(activeQuestion)}
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <footer className="flex justify-between items-center border-t p-4 bg-background">
                     <Button variant="outline" onClick={() => toggleReviewFlag(activeQuestion.id)}>
                        <Flag className={cn("mr-2 h-4 w-4", reviewFlags[activeQuestion.id] && "fill-yellow-500 text-yellow-600")} />
                        {reviewFlags[activeQuestion.id] ? 'Unflag for Review' : 'Flag for Review'}
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setActiveQuestionIndex(p => Math.max(0, p - 1))} disabled={activeQuestionIndex === 0}>
                            Previous
                        </Button>
                        <Button onClick={() => setActiveQuestionIndex(p => Math.min(exam.questions.length - 1, p + 1))} disabled={activeQuestionIndex === exam.questions.length - 1}>
                            Next
                        </Button>
                    </div>
                     <Button onClick={() => onTimeUp(answers)} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Submit Exam
                    </Button>
                </footer>
            </main>
            
            {/* Right Sidebar for accessibility */}
            <RightSidebar />
        </div>
    );
}

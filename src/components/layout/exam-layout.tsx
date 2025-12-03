
'use client';

import { useState, useMemo, useEffect, useRef, useCallback }from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Timer } from '@/components/Timer';
import { useProctoring } from '@/hooks/use-proctoring';
import { useToast } from '@/hooks/use-toast';
import type { SelectedExamDetails, AssessmentQuestion } from '@/app/(app)/assessment/[examId]/page';
import { Flag, Loader2, Volume2, Mic, MicOff, ChevronRight, ChevronLeft, HelpCircle, Lightbulb, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RightSidebar } from './right-sidebar';
import { useExamMode } from '@/hooks/use-exam-mode';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useAccessibilityPanel } from '../accessibility/accessibility-panel-provider';
import { getTTS } from "@/lib/actions/chatbot";
import { useVoiceControl } from '../voice-control-provider';
import { captureVoiceAnswer } from '@/lib/actions/voice-answer';
import { Switch } from '../ui/switch';
import { HandwritingPad } from '../HandwritingPad';
import { recognizeHandwritingAction } from '@/lib/actions/handwriting';
import { Progress } from '../ui/progress';

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
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [stepAnswers, setStepAnswers] = useState<Record<string, string[]>>({});
    const { toast } = useToast();
    const { setIsExamMode } = useExamMode();
    const { userProfile, isLoading: isProfileLoading } = useAccessibilityPanel();
    const [isTTSSpeaking, setIsTTSSpeaking] = useState(false);
    const [isSTTRecording, setIsSTTRecording] = useState(false);
    const [isProcessingHandwriting, setIsProcessingHandwriting] = useState(false);
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const examLayoutRef = useRef<HTMLDivElement>(null);
    
    // SLD state
    const [isSimplifiedMode, setIsSimplifiedMode] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);

    const activeQuestion: AssessmentQuestion = exam.questions[activeQuestionIndex];
    const isStepwiseQuestion = activeQuestion.type === 'long-answer' && (activeQuestion.stepByStepHints?.length || 0) > 0;

    useEffect(() => {
        // When question changes, reset the step to the beginning
        setCurrentStepIndex(0);
    }, [activeQuestionIndex]);

    const handleStepAnswerChange = (questionId: string, stepIndex: number, value: string) => {
        const newStepAnswers = { ...stepAnswers };
        if (!newStepAnswers[questionId]) {
            newStepAnswers[questionId] = [];
        }
        newStepAnswers[questionId][stepIndex] = value;
        setStepAnswers(newStepAnswers);

        // Auto-combine step answers into the main answer
        const combinedAnswer = newStepAnswers[questionId].join(' \n\n');
        setAnswers(prev => ({ ...prev, [questionId]: combinedAnswer }));
    };

    const accessibility = userProfile?.accessibility_profile || {};
    const isTextToSpeechEnabled = accessibility.textToSpeech;
    const isSpeechToTextEnabled = accessibility.speechToText;
    const isVoiceNavigationEnabled = accessibility.voiceNavigation;
    const useFocusMode = accessibility.focusMode || accessibility.simplifiedLayout;
    const textSizeClass = accessibility.largeText === 'large' ? 'text-lg' : accessibility.largeText === 'xlarge' ? 'text-xl' : '';

    // Automatically enable simplified mode if the profile has the setting.
    useEffect(() => {
        if(accessibility.textSimplifier && accessibility.textSimplifier !== 'off') {
            setIsSimplifiedMode(true);
        }
    }, [accessibility.textSimplifier]);

    useEffect(() => {
        setIsExamMode(true);
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }
        return () => setIsExamMode(false);
    }, [setIsExamMode]);

     const playTTS = useCallback(async (text: string, onEnd?: () => void) => {
        if (isTTSSpeaking || !audioRef.current || !isTextToSpeechEnabled) return;
        setIsTTSSpeaking(true);
        try {
            const result = await getTTS({ text, profile: accessibility.ttsProfile || 'normal' });
            if ('media' in result && audioRef.current) {
                audioRef.current.src = result.media;
                audioRef.current.play();
                audioRef.current.onended = () => {
                    setIsTTSSpeaking(false);
                    onEnd?.();
                };
            } else {
                setIsTTSSpeaking(false);
                onEnd?.();
            }
        } catch (error) {
            console.error("TTS Error:", error);
            setIsTTSSpeaking(false);
            onEnd?.();
        }
    }, [isTTSSpeaking, isTextToSpeechEnabled, accessibility.ttsProfile]);


    const readQuestionAndOptions = useCallback(() => {
        const questionStem = isSimplifiedMode ? activeQuestion.simplifiedStem || activeQuestion.question : activeQuestion.question;
        const questionText = `Question ${activeQuestionIndex + 1} of ${exam.questions.length}. ${questionStem}`;
        
        let optionsText = "";
        if (activeQuestion.type === 'mcq' && activeQuestion.options) {
            optionsText = activeQuestion.options.map((opt, i) => `Option ${String.fromCharCode(65 + i)}: ${opt}`).join('. ');
        }
        
        const fullText = `${questionText}. ${optionsText} Say 'Select A' or 'Repeat' to hear again.`;

        playTTS(fullText);
    }, [activeQuestion, activeQuestionIndex, exam.questions.length, playTTS, isSimplifiedMode]);

    useEffect(() => {
        if (isTextToSpeechEnabled && activeQuestion) {
            readQuestionAndOptions();
        }
    }, [activeQuestion, isTextToSpeechEnabled, readQuestionAndOptions]);

    const proctoringCallbacks = useMemo(() => ({
        onLeave: (reason: 'visibility' | 'fullscreen', ttsText: string) => {
          if (isTextToSpeechEnabled) {
            playTTS(ttsText);
          }
        },
        onViolationLimitReached: () => {
          toast({
            variant: 'destructive',
            title: 'Exam Automatically Submitted',
            description: 'You have left the exam tab more than once.',
          });
          onTimeUp(answers);
        }
    }), [toast, onTimeUp, answers, isTextToSpeechEnabled, playTTS]);

    useProctoring({
        isActive: true,
        ...proctoringCallbacks
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!examLayoutRef.current) return;
            if (e.key === 'Tab') {
                const focusableElements = Array.from(
                    examLayoutRef.current.querySelectorAll(
                        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
                    )
                ).filter(el => !(el as HTMLElement).hasAttribute('disabled') && (el as HTMLElement).offsetParent !== null) as HTMLElement[];

                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    // If shift+tab is pressed on the first element, wrap to the last
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    // If tab is pressed on the last element, wrap to the first
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        const currentRef = examLayoutRef.current;
        currentRef?.addEventListener('keydown', handleKeyDown);

        return () => {
            currentRef?.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        if (accessibility.autoSave) {
            // Here you would typically trigger a non-blocking save to Firestore
            console.log(`Autosaving answer for ${questionId}: ${value}`);
             toast({
                title: 'Answer Saved',
                description: 'Your answer has been automatically saved.',
                duration: 2000,
             });
        }
        if(isTextToSpeechEnabled) {
            const selectedOption = exam.questions.find(q => q.id === questionId)?.options.find(o => o === value);
            if(selectedOption) {
                playTTS(`You selected: ${value}`);
            }
        }
    };

    const handleHandwritingConfirm = async (text: string, imageDataUri: string) => {
        setIsProcessingHandwriting(true);
        const result = await recognizeHandwritingAction({ imageDataUri });
        if ('error' in result) {
            toast({ variant: 'destructive', title: 'Handwriting Recognition Failed', description: result.error });
            handleAnswerChange(activeQuestion.id, "Error in recognition.");
        } else {
            toast({ title: 'Handwriting Recognized', description: `Confidence: ${(result.confidence * 100).toFixed(0)}%` });
            handleAnswerChange(activeQuestion.id, result.text);
        }
        setIsProcessingHandwriting(false);
    };
    
    const toggleReviewFlag = (questionId: string) => {
        setReviewFlags(prev => ({...prev, [questionId]: !prev[questionId]}));
    }

    const toggleSTT = (questionId: string, stepIndex?: number) => {
        if (isSTTRecording) {
            recognitionRef.current?.stop();
        } else {
            startSTT(questionId, stepIndex);
        }
    };

    const startSTT = (questionId: string, stepIndex?: number) => {
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
        recognitionRef.current.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            
            const processedResult = await captureVoiceAnswer({
                raw_transcript: transcript,
                question_type: activeQuestion.type || 'short-answer',
            });

            const answerText = ('error' in processedResult || processedResult.requires_clarify) 
                ? transcript // fallback to raw transcript
                : processedResult.normalized_text;
            
            if (isStepwiseQuestion && stepIndex !== undefined) {
                handleStepAnswerChange(questionId, stepIndex, answerText);
            } else {
                handleAnswerChange(questionId, answerText);
            }

            if ('error' in processedResult) {
                toast({ variant: 'destructive', title: "Could not process voice answer", description: processedResult.error });
            } else if (processedResult.requires_clarify) {
                playTTS("I didn't catch that clearly. Please try again or type your answer.");
            }
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

        if (isStepwiseQuestion) {
            const hints = question.stepByStepHints || [];
            const currentHint = hints[currentStepIndex];

            return (
                <div className="mt-4 space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="font-semibold text-lg">{currentHint}</p>
                        <Textarea
                            placeholder={`Your answer for step ${currentStepIndex + 1}...`}
                            value={stepAnswers[questionId]?.[currentStepIndex] || ''}
                            onChange={(e) => handleStepAnswerChange(questionId, currentStepIndex, e.target.value)}
                            className="mt-2 min-h-[120px]"
                        />
                    </div>
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <span className="text-sm text-muted-foreground">Step {currentStepIndex + 1} of {hints.length}</span>
                              <Progress value={((currentStepIndex + 1) / hints.length) * 100} className="w-32" />
                         </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setCurrentStepIndex(p => Math.max(0, p - 1))} disabled={currentStepIndex === 0}>
                                Previous Step
                            </Button>
                            <Button onClick={() => setCurrentStepIndex(p => Math.min(hints.length - 1, p + 1))} disabled={currentStepIndex === hints.length - 1}>
                                Next Step
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }

        const sttButton = isSpeechToTextEnabled && ['short-answer', 'long-answer', 'fillup'].includes(question.type || 'mcq') && (
            <Button
              size="icon"
              variant={isSTTRecording ? 'destructive' : 'outline'}
              onClick={() => toggleSTT(questionId)}
              className="ml-2"
              aria-label="Speak Answer"
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
                        aria-label='Multiple choice options'
                    >
                        {question.options.filter(opt => opt).map((option, i) => (
                            <div key={i} className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                                <RadioGroupItem value={option} id={`q${activeQuestionIndex}-o${i}`} />
                                <Label htmlFor={`q${activeQuestionIndex}-o${i}`} className={cn("font-normal text-base flex-1 cursor-pointer", textSizeClass)}>
                                   <span className="font-bold mr-2">{String.fromCharCode(65 + i)}:</span> {option}
                                </Label>
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
                             className={cn("h-12", textSizeClass)}
                        />
                        {sttButton}
                    </div>
                );
            case 'long-answer':
                 return (
                    <div className="flex items-start mt-4">
                        <Textarea
                            className={cn("min-h-[150px]", textSizeClass)}
                            placeholder="Your detailed answer"
                            value={value}
                            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                        />
                        {sttButton}
                    </div>
                );
            case 'handwriting':
                return (
                    <div className="mt-4">
                        <HandwritingPad 
                            onConfirm={handleHandwritingConfirm}
                            isProcessing={isProcessingHandwriting}
                        />
                         {value && value !== 'Handwritten answer submitted.' && (
                            <div className="mt-4 p-4 border rounded-md bg-green-500/10 border-green-500/20">
                               <p className="text-sm font-semibold text-green-700 dark:text-green-400">Recognized Text:</p>
                               <p className="font-mono text-foreground">{value}</p>
                            </div>
                        )}
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
                                <Label htmlFor={`q${activeQuestionIndex}-o${i}`} className={cn("font-normal text-base flex-1 cursor-pointer", textSizeClass)}>
                                   <span className="font-bold mr-2">{String.fromCharCode(65 + i)}:</span> {option}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                 )
        }
    }

    const handleVoiceCommand = useCallback((command: string) => {
        if (!isVoiceNavigationEnabled) return;

        const lower = command.toLowerCase();
        if (lower.startsWith("select option") || lower.startsWith("choose option")) {
            const optionLetter = lower.split(' ').pop();
            if (optionLetter && activeQuestion.type === 'mcq') {
                const optionIndex = optionLetter.charCodeAt(0) - 'a'.charCodeAt(0);
                if(optionIndex >= 0 && optionIndex < activeQuestion.options.length) {
                    handleAnswerChange(activeQuestion.id, activeQuestion.options[optionIndex]);
                }
            }
        } else if (lower.includes("next question") || lower.includes("next")) {
            setActiveQuestionIndex(p => Math.min(exam.questions.length - 1, p + 1));
        } else if (lower.includes("previous question") || lower.includes("previous")) {
            setActiveQuestionIndex(p => Math.max(0, p - 1));
        } else if (lower.startsWith("go to question")) {
            const num = parseInt(lower.replace('go to question', '').trim());
            if(!isNaN(num) && num > 0 && num <= exam.questions.length) {
                setActiveQuestionIndex(num - 1);
            }
        } else if(lower.includes('flag this question') || lower.includes('mark for review')) {
            toggleReviewFlag(activeQuestion.id);
        } else if (lower.includes('submit exam') || lower.includes('finish exam')) {
            onTimeUp(answers);
        } else if (lower.includes('repeat')) {
            readQuestionAndOptions();
        } else if(isSpeechToTextEnabled && (lower.startsWith('answer') || lower.startsWith('my answer is'))) {
            const spokenAnswer = command.substring(command.indexOf(' ') + 1);
            handleAnswerChange(activeQuestion.id, spokenAnswer);
        }
    }, [activeQuestion, exam.questions.length, onTimeUp, answers, isVoiceNavigationEnabled, readQuestionAndOptions, isSpeechToTextEnabled]);

    useEffect(() => {
        // This is a simplified listener for global voice commands during an exam.
        const handleGlobalCommand = (event: CustomEvent) => {
            handleVoiceCommand(event.detail);
        };
        
        window.addEventListener('voiceCommand', handleGlobalCommand as EventListener);
        return () => window.removeEventListener('voiceCommand', handleGlobalCommand as EventListener);
    }, [handleVoiceCommand]);
    
    const answeredCount = Object.keys(answers).filter(key => answers[key] && answers[key].trim() !== '').length;
    const reviewedCount = Object.keys(reviewFlags).filter(k => reviewFlags[k]).length;
    
    const displayStem = isSimplifiedMode && !showOriginal ? activeQuestion.simplifiedStem || activeQuestion.question : activeQuestion.question;
    const canShowSimplified = isSimplifiedMode && activeQuestion.simplifiedStem && activeQuestion.simplifiedStem !== activeQuestion.question;

    return (
        <div ref={examLayoutRef} className={cn(
            "fixed inset-0 bg-background flex noselect",
            accessibility.dyslexiaFriendlyFont && "font-dyslexic",
            accessibility.highContrast && "dark",
            textSizeClass
        )} onContextMenu={(e) => e.preventDefault()}>
            <audio ref={audioRef} className="hidden" />
            
            {/* Left Panel: Question Palette */}
            {!useFocusMode && (
                 <div className="w-64 border-r bg-card flex flex-col p-4">
                    <h3 className="font-bold text-lg mb-1">Questions</h3>
                    <p className="text-xs text-muted-foreground mb-4">Navigate between questions.</p>
                    <ScrollArea className="flex-1 pr-2">
                        <div className="grid grid-cols-5 gap-2" data-testid="question-palette">
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
                                        aria-label={`Go to question ${index + 1}`}
                                        data-question-index={index}
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
                    <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500/20 border-yellow-500"/> Review</div> <span>{reviewedCount}</span></div>
                    </div>
                </div>
            )}

            {/* Main Panel: Exam Content */}
            <main className="flex-1 flex flex-col md:mr-16">
                <header className="flex justify-between items-center border-b p-4">
                    <div>
                        <h1 className={cn("text-xl font-bold", textSizeClass)}>{exam.title}</h1>
                        <p className={cn("text-sm text-muted-foreground", textSizeClass)}>{exam.subject}</p>
                    </div>
                     <div className="flex items-center gap-4">
                        {isTextToSpeechEnabled && (
                            <div className="flex gap-2">
                                <Button size="icon" variant="outline" onClick={() => playTTS(activeQuestion.question)} disabled={isTTSSpeaking} aria-label="Read Question Aloud">
                                    <Volume2 />
                                </Button>
                                {activeQuestion.options && activeQuestion.options.length > 0 && (
                                    <Button size="icon" variant="outline" onClick={() => playTTS(activeQuestion.options.map((opt, i) => `Option ${String.fromCharCode(65 + i)}: ${opt}`).join('. '))} disabled={isTTSSpeaking} aria-label="Read Options Aloud">
                                        <HelpCircle />
                                    </Button>
                                )}
                            </div>
                        )}
                        {exam.durationMinutes && (
                            <Timer
                                durationInMinutes={exam.durationMinutes}
                                onTimeUp={() => onTimeUp(answers)}
                            />
                        )}
                     </div>
                </header>
                <ScrollArea className="flex-1">
                    <div className="p-8">
                        {activeQuestion && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className={cn("text-lg font-semibold", textSizeClass)}>Question {activeQuestionIndex + 1} of {exam.questions.length}</h2>
                                    {isSimplifiedMode && (
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="show-original">Show Original</Label>
                                            <Switch id="show-original" checked={showOriginal} onCheckedChange={setShowOriginal} />
                                        </div>
                                    )}
                                </div>
                                <p className={cn("text-xl mb-6", textSizeClass)}>{displayStem}</p>
                                
                                {isSimplifiedMode && !isStepwiseQuestion && activeQuestion.stepByStepHints && activeQuestion.stepByStepHints.length > 0 && (
                                    <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg space-y-2">
                                        <h4 className="font-semibold flex items-center gap-2 text-accent"><Lightbulb className="h-4 w-4" /> Step-by-Step Hints</h4>
                                        <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                                            {activeQuestion.stepByStepHints.map((hint, i) => <li key={i}>{hint}</li>)}
                                        </ul>
                                    </div>
                                )}

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
                            <ChevronLeft /> Previous
                        </Button>
                        <Button onClick={() => setActiveQuestionIndex(p => Math.min(exam.questions.length - 1, p + 1))} disabled={activeQuestionIndex === exam.questions.length - 1}>
                            Next <ChevronRight />
                        </Button>
                    </div>
                     <Button onClick={() => onTimeUp(answers)} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check />}
                        Submit Exam
                    </Button>
                </footer>
            </main>
            
            {/* Right Sidebar for accessibility */}
            <RightSidebar />
        </div>
    );
}

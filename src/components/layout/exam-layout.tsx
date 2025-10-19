'use client';

import { useState, useMemo } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Timer } from '@/components/Timer';
import { useProctoring } from '@/hooks/use-proctoring';
import { useToast } from '@/hooks/use-toast';
import type { SelectedExamDetails, AssessmentQuestion } from '@/app/(app)/assessment/page';
import { ArrowLeft, Flag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RightSidebar } from './right-sidebar';

interface ExamLayoutProps {
    exam: SelectedExamDetails;
    onTimeUp: () => void;
    onExit: () => void;
    isSubmitting: boolean;
}

type AnswerStatus = 'answered' | 'unanswered' | 'review';

export function ExamLayout({ exam, onTimeUp, onExit, isSubmitting }: ExamLayoutProps) {
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [reviewFlags, setReviewFlags] = useState<Record<string, boolean>>({});
    const { toast } = useToast();

    const proctoringCallbacks = useMemo(() => ({
        onLeave: () => {
          toast({
            variant: 'destructive',
            title: 'Warning: Left Exam Tab',
            description: 'Leaving the exam tab is prohibited. Further violations will result in automatic submission.',
          });
        },
        onViolationLimitReached: () => {
          toast({
            variant: 'destructive',
            title: 'Exam Automatically Submitted',
            description: 'You have left the exam tab too many times.',
          });
          onTimeUp(); // Use the same handler for submission
        }
    }), [toast, onTimeUp]);

    useProctoring({
        isActive: true, // Always active when this layout is shown
        ...proctoringCallbacks
    });

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };
    
    const toggleReviewFlag = (questionId: string) => {
        setReviewFlags(prev => ({...prev, [questionId]: !prev[questionId]}));
    }

    const activeQuestion: AssessmentQuestion = exam.questions[activeQuestionIndex];
    
    const getQuestionStatus = (index: number): AnswerStatus => {
        const questionId = exam.questions[index].id;
        if(reviewFlags[questionId]) return 'review';
        if(answers[questionId]) return 'answered';
        return 'unanswered';
    }
    
    const answeredCount = Object.keys(answers).length;
    const reviewedCount = Object.keys(reviewFlags).filter(k => reviewFlags[k]).length;

    return (
        <div className="fixed inset-0 bg-background flex">
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
                            onTimeUp={onTimeUp}
                        />
                    )}
                </header>
                <ScrollArea className="flex-1">
                    <div className="p-8">
                        {activeQuestion && (
                            <div>
                                <h2 className="text-lg font-semibold mb-6">Question {activeQuestionIndex + 1} of {exam.questions.length}</h2>
                                <p className="text-xl mb-6">{activeQuestion.question}</p>
                                <RadioGroup
                                    className="mt-4 space-y-3"
                                    value={answers[activeQuestion.id] || ""}
                                    onValueChange={(value) => handleAnswerChange(activeQuestion.id, value)}
                                >
                                    {activeQuestion.options.filter(opt => opt).map((option, i) => (
                                        <div key={i} className="flex items-center space-x-3 space-y-0 p-4 border rounded-lg hover:bg-muted/50 has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors">
                                            <RadioGroupItem value={option} id={`q${activeQuestionIndex}-o${i}`} />
                                            <Label htmlFor={`q${activeQuestionIndex}-o${i}`} className="font-normal text-base flex-1 cursor-pointer">
                                                {option}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
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
                     <Button onClick={onTimeUp} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Finish & Submit Exam
                    </Button>
                </footer>
            </main>
            
            {/* Right Sidebar for accessibility */}
            <RightSidebar />
        </div>
    );
}

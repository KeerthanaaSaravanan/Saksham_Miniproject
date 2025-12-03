
'use client';

import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/firebase';
import { ExamLayout } from '@/components/layout/exam-layout';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export type AssessmentQuestion = {
  id: string;
  question: string;
  options: string[];
  type?: 'mcq' | 'fillup' | 'short-answer' | 'long-answer';
  explanation?: string;
  correctAnswer?: string;
  simplifiedStem?: string;
  stepByStepHints?: string[];
};

export type SelectedExamDetails = {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
    startTime: Date;
    endTime: Date;
    durationMinutes?: number;
    questions: AssessmentQuestion[];
};

const MOCK_EXAMS: Record<string, SelectedExamDetails> = {
    'exam1': {
        id: 'exam1',
        title: 'Mid-Term Social Studies',
        subject: 'Social Studies',
        gradeLevel: 'Class 8',
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        durationMinutes: 60,
        questions: [
            { id: 'q1', question: 'Who was the first Mughal emperor of India, and what was his primary military innovation?', options: ['Babur, gunpowder', 'Akbar, composite bows', 'Humayun, war elephants', 'Shah Jahan, siege cannons'], type: 'mcq', correctAnswer: 'Babur, gunpowder', simplifiedStem: 'Who was India\'s first Mughal emperor?' },
            { id: 'q2', question: 'The French Revolution, a period of radical social and political upheaval in France, began in the year ____.', type: 'fillup', correctAnswer: '1789', simplifiedStem: 'When did the French Revolution start?' },
            { id: 'q3', question: 'Explain the primary causes of World War I, including the alliance systems, imperialism, militarism, and nationalism.', type: 'long-answer', options: [], correctAnswer: 'WW1 causes include MAIN: Militarism, Alliances, Imperialism, Nationalism. Assassination of Archduke Ferdinand was the trigger.', simplifiedStem: 'Why did World War 1 happen?', stepByStepHints: ['Mention the four MAIN long-term causes.', 'What was the immediate trigger for the war?'] },
        ]
    }
};

export default function AssessmentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const params = useParams();
  const examId = params.examId as string;
  
  const { user } = useUser();
  
  const [selectedExam, setSelectedExam] = useState<SelectedExamDetails | null>(null);
  const [isLoadingExam, setIsLoadingExam] = useState(true);

  useEffect(() => {
    setIsLoadingExam(true);
    setError(null);
    setTimeout(() => {
        const exam = MOCK_EXAMS[examId];
        if(exam) {
            setSelectedExam(exam);
        } else {
            setError("The requested exam could not be found.");
        }
        setIsLoadingExam(false);
    }, 1000);
  }, [examId]);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        if(document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
  }, []);

  const handleSubmitExam = useCallback(async (answers: Record<string, string>) => {
    if (isSubmitting || !selectedExam || !user) return;

    setIsSubmitting(true);
    toast({ title: 'Submitting Exam...', description: 'Please wait while we process your submission.' });

    // Mock submission
    console.log("Mock submitting exam:", {
        examId: selectedExam.id,
        userId: user.uid,
        answers
    });
    
    setTimeout(() => {
        toast({
            title: "Exam Submitted Successfully!",
            description: `Your answers have been saved. You can now close this tab.`
        });
        setIsSubmitting(true); // Keep in submitting state to show completion message
    }, 1500);
    
  }, [isSubmitting, selectedExam, user, toast]);
  
  const handleEnterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Fullscreen Required',
        description: `Could not enter fullscreen mode. Please allow fullscreen in your browser settings and try again.`
      });
    }
  };


  if (isLoadingExam) {
      return (
          <div className="fixed inset-0 bg-background flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Loading Exam...</p>
          </div>
      )
  }

  // After submission is successful, isSubmitting stays true.
  if (isSubmitting) {
      return (
           <div className="fixed inset-0 bg-background flex flex-col justify-center items-center text-center p-4">
              <h1 className="text-3xl font-bold text-primary">Exam Submitted Successfully!</h1>
              <p className="text-muted-foreground mt-2">Your responses have been recorded. You may now close this window.</p>
          </div>
      )
  }

  if (error || !selectedExam) {
       return (
           <div className="fixed inset-0 bg-background flex flex-col justify-center items-center text-center p-4">
              <h1 className="text-2xl font-bold text-destructive">Error: Could not load the exam.</h1>
              <p className="text-muted-foreground mt-2">{error || "Please try again later."}</p>
              <Button className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
          </div>
      )
  }

  if (!isFullScreen) {
      return (
        <div className="fixed inset-0 bg-background flex flex-col justify-center items-center text-center p-4">
            <h1 className="text-3xl font-bold font-headline">Ready to Begin?</h1>
            <p className="text-muted-foreground mt-2 max-w-md">
                This assessment requires fullscreen mode to ensure a focused environment. Please click below to start.
            </p>
            <Button size="lg" className="mt-6" onClick={handleEnterFullscreen}>
                Start Exam
            </Button>
        </div>
      );
  }

  return (
    <ExamLayout 
        exam={selectedExam}
        onTimeUp={handleSubmitExam}
        isSubmitting={isSubmitting}
    />
  );
}

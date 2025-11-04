
'use client';

import {
  useToast,
} from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/firebase';
import { ExamLayout } from '@/components/layout/exam-layout';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Matches the Firestore data structure
type Exam = {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
    startTime: Date;
    endTime: Date;
    durationMinutes?: number;
};

export type AssessmentQuestion = {
  id: string;
  question: string;
  options: string[];
  type?: 'mcq' | 'fillup' | 'short-answer' | 'long-answer';
  explanation?: string;
  correctAnswer?: string;
};

export type SelectedExamDetails = Exam & {
    questions: AssessmentQuestion[];
}

const MOCK_EXAMS: { [key: string]: SelectedExamDetails } = {
    'exam1': {
        id: 'exam1',
        title: 'Mid-Term Social Studies',
        subject: 'Social Studies',
        gradeLevel: 'Class 8',
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        durationMinutes: 60,
        questions: [
            { id: 'q1', question: 'Who was the first President of the United States?', options: ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'John Adams'], type: 'mcq', correctAnswer: 'George Washington' },
            { id: 'q2', question: 'The ancient city of Rome was built on how many hills?', options: [], type: 'short-answer', correctAnswer: '7' },
        ]
    },
     'exam2': {
        id: 'exam2',
        title: 'Annual Physics Exam',
        subject: 'Physics',
        gradeLevel: 'Class 11',
        startTime: new Date(),
        endTime: new Date(Date.now() + 180 * 60 * 1000),
        durationMinutes: 180,
        questions: [
            { id: 'q3', question: 'What is the formula for Force?', options: ['E=mc^2', 'F=ma', 'H2O', 'a^2+b^2=c^2'], type: 'mcq', correctAnswer: 'F=ma' },
        ]
    },
};


export default function AssessmentPage() {
  const [selectedExam, setSelectedExam] = useState<SelectedExamDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExam, setIsLoadingExam] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const params = useParams();
  const examId = params.examId as string;
  
  const { user } = useUser();
  

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

  useEffect(() => {
    setIsLoadingExam(true);
    // Simulate fetching exam
    setTimeout(() => {
        const examData = MOCK_EXAMS[examId];
        if (examData) {
            setSelectedExam(examData);
        } else {
            setError("The requested exam could not be found.");
        }
        setIsLoadingExam(false);
    }, 500);
  }, [examId]);

  const handleSubmitExam = useCallback(async (answers: Record<string, string>) => {
    if (isSubmitting || !selectedExam || !user) return;

    setIsSubmitting(true);
    toast({ title: 'Submitting Exam...', description: 'Please wait while we process your submission.' });

    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
        title: "Exam Submitted Successfully (Mock)",
        description: `Your answers have been saved. You can now close this tab.`
    });
    // We can't close the tab automatically due to browser security
    // So we can replace the UI to prevent re-submission.
    setIsSubmitting(true); // Keep in submitting state to show completion message
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

    
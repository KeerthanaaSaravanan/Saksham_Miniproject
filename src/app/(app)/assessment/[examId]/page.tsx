
'use client';

import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { ExamLayout } from '@/components/layout/exam-layout';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { doc, setDoc, serverTimestamp, getDoc, collection } from 'firebase/firestore';

export type AssessmentQuestion = {
  id: string;
  question: string;
  options: string[];
  type?: 'mcq' | 'fillup' | 'short-answer' | 'long-answer' | 'handwriting';
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
    startTime: { toDate: () => Date };
    endTime: { toDate: () => Date };
    durationMinutes?: number;
    questions: AssessmentQuestion[];
};

export default function AssessmentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;
  
  const { user } = useUser();
  const db = useFirestore();

  const examRef = useMemoFirebase(() => db ? doc(db, 'exams', examId) : null, [db, examId]);
  const { data: selectedExam, isLoading: isLoadingExam } = useDoc<SelectedExamDetails>(examRef);

  useEffect(() => {
    const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!document.fullscreenElement;
        setIsFullScreen(isCurrentlyFullscreen);
        if (!isCurrentlyFullscreen && !isSubmitting) {
             toast({
                variant: 'destructive',
                title: 'Fullscreen Required',
                description: `You have left fullscreen. Please re-enter to continue the exam.`
            });
        }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        if(document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
  }, [isSubmitting, toast]);

  const handleSubmitExam = useCallback(async (answers: Record<string, string>) => {
    if (isSubmitting || !selectedExam || !user || !db) return;

    setIsSubmitting(true);
    toast({ title: 'Submitting Exam...', description: 'Please wait while we process your submission.' });

    const submissionRef = doc(collection(db, 'submissions'));
    const submissionData = {
        examId: selectedExam.id,
        studentId: user.uid,
        submittedAt: serverTimestamp(),
        status: 'submitted',
        responses: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
        // Include student details for easier querying on the admin side
        studentName: user.displayName,
        studentEmail: user.email,
    };
    
    try {
        await setDoc(submissionRef, submissionData);
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        // UI will switch to "Submitted" message based on isSubmitting state
    } catch(err: any) {
        console.error("Submission error:", err);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: `Could not save your answers. ${err.message}`
        });
        setIsSubmitting(false); // Allow retry
    }
    
  }, [isSubmitting, selectedExam, user, db, toast]);
  
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
              <Button className="mt-6" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          </div>
      )
  }

  if (error || !selectedExam) {
       return (
           <div className="fixed inset-0 bg-background flex flex-col justify-center items-center text-center p-4">
              <h1 className="text-2xl font-bold text-destructive">Error: Could not load the exam.</h1>
              <p className="text-muted-foreground mt-2">{error || "Please check the exam ID or try again later."}</p>
              <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
          </div>
      )
  }
  
  const isExamActive = selectedExam.startTime.toDate() <= new Date() && selectedExam.endTime.toDate() > new Date();

  if (!isExamActive) {
      return (
           <div className="fixed inset-0 bg-background flex flex-col justify-center items-center text-center p-4">
              <h1 className="text-2xl font-bold text-destructive">Exam Not Active</h1>
              <p className="text-muted-foreground mt-2">This exam is not currently active. Please check the scheduled time.</p>
              <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
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

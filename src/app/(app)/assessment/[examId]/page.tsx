
'use client';

import {
  useToast,
} from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
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
import { doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import type { WithId } from '@/firebase';


type Exam = WithId<{
    title: string;
    subject: string;
    gradeLevel: string;
    startTime: { seconds: number };
    endTime: { seconds: number };
    durationMinutes?: number;
}>;

export type AssessmentQuestion = WithId<{
  question: string;
  options: string[];
  type?: 'mcq' | 'fillup' | 'short-answer' | 'long-answer';
  explanation?: string;
  correctAnswer?: string;
}>;

export type SelectedExamDetails = Exam & {
    questions: AssessmentQuestion[];
}


export default function AssessmentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const params = useParams();
  const examId = params.examId as string;
  
  const { user } = useUser();
  const firestore = useFirestore();

  const examRef = useMemoFirebase(() => firestore && examId && doc(firestore, 'exams', examId), [firestore, examId]);
  const { data: examData, isLoading: isExamLoading } = useDoc<Exam>(examRef);

  const questionsQuery = useMemoFirebase(() => firestore && examId && collection(firestore, `exams/${examId}/questions`), [firestore, examId]);
  const { data: questions, isLoading: areQuestionsLoading } = useCollection<AssessmentQuestion>(questionsQuery);
  
  const selectedExam = useMemo(() => {
    if (!examData || !questions) return null;
    return { ...examData, questions };
  }, [examData, questions]);
  
  const isLoadingExam = isExamLoading || areQuestionsLoading;

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
    if (isSubmitting || !selectedExam || !user || !firestore) return;

    setIsSubmitting(true);
    toast({ title: 'Submitting Exam...', description: 'Please wait while we process your submission.' });

    const submissionRef = collection(firestore, `exams/${selectedExam.id}/submissions`);
    
    try {
        const batch = writeBatch(firestore);

        const newSubmissionRef = doc(submissionRef);
        batch.set(newSubmissionRef, {
            userId: user.uid,
            studentName: user.displayName,
            examId: selectedExam.id,
            submittedAt: serverTimestamp(),
            status: 'Pending',
            score: 0,
        });

        // Save each answer in a subcollection
        const answersRef = collection(newSubmissionRef, 'answers');
        Object.entries(answers).forEach(([questionId, answer]) => {
            const answerRef = doc(answersRef, questionId);
            batch.set(answerRef, { answer, questionId });
        });
        
        await batch.commit();

        toast({
            title: "Exam Submitted Successfully!",
            description: `Your answers have been saved. You can now close this tab.`
        });
        setIsSubmitting(true); // Keep in submitting state to show completion message

    } catch (e: any) {
        console.error("Submission Error:", e);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: e.message || "An error occurred while submitting your exam."
        });
        setIsSubmitting(false);
    }
    
  }, [isSubmitting, selectedExam, user, firestore, toast]);
  
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

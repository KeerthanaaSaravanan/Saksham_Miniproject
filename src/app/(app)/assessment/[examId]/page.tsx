
'use client';

import {
  useToast,
} from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError, useMemoFirebase } from '@/firebase';
import { collection, doc, Timestamp, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { ExamLayout } from '@/components/layout/exam-layout';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Matches the Firestore data structure
type Exam = {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
    startTime: Timestamp;
    endTime: Timestamp;
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

export default function AssessmentPage() {
  const [selectedExam, setSelectedExam] = useState<SelectedExamDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExam, setIsLoadingExam] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const { toast } = useToast();
  const params = useParams();
  const examId = params.examId as string;
  
  const { user } = useUser();
  const firestore = useFirestore();
  

  const examRef = useMemoFirebase(() => {
    if (!firestore || !examId) return null;
    return doc(firestore, 'exams', examId);
  }, [firestore, examId]);

  const { data: examData, isLoading: isExamDataLoading } = useDoc<Exam>(examRef);

  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Exit fullscreen when component unmounts
    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        if(document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
        if (!examData || !firestore) return;

        try {
            const questionsCollectionRef = collection(firestore, 'exams', examData.id, 'questions');
            const querySnapshot = await getDocs(questionsCollectionRef);
            const questions = querySnapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
            })) as AssessmentQuestion[];

            setSelectedExam({ ...examData, questions });
        } catch (error: any) {
            const permissionError = new FirestorePermissionError({
                path: `exams/${examData.id}/questions`,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
             toast({ variant: 'destructive', title: 'Error Loading Questions', description: 'Could not fetch exam questions.' });
        } finally {
            setIsLoadingExam(false);
        }
    }

    if (examData) {
        loadQuestions();
    }
  }, [examData, firestore, toast]);

  const handleSubmitExam = useCallback(async (answers: Record<string, string>) => {
    if (isSubmitting || !selectedExam || !user || !firestore) return;

    setIsSubmitting(true);
    toast({ title: 'Submitting Exam...', description: 'Please wait while we process your submission.' });

    const attemptRef = doc(collection(firestore, 'users', user.uid, 'exam_attempts'));
    const answersCollectionRef = collection(attemptRef, 'answers');

    const batch = writeBatch(firestore);

    const studentAnswers = Object.entries(answers).map(([questionId, answer]) => {
      return {
        questionId,
        answer,
        studentExamAttemptId: attemptRef.id,
      };
    });
    
    studentAnswers.forEach(ans => {
        const answerRef = doc(answersCollectionRef);
        batch.set(answerRef, ans);
    });

    batch.set(attemptRef, {
        userId: user.uid,
        examId: selectedExam.id,
        startTime: new Date(), // This should ideally be when the student starts
        endTime: serverTimestamp(),
        score: 0, // Score is 0 initially, to be graded manually
        status: 'submitted',
    });

    batch.commit()
      .then(() => {
          toast({
              title: "Exam Submitted Successfully",
              description: `Your answers have been saved for grading. You can now close this tab.`
          });
          // We can't close the tab automatically due to browser security
          // So we can replace the UI to prevent re-submission.
          setIsSubmitting(true);
      })
      .catch((error: any) => {
          const permissionError = new FirestorePermissionError({
              path: attemptRef.path,
              operation: 'write', // This is a batch write operation
              requestResourceData: { 
                  attempt: { examId: selectedExam.id, score: 0, status: 'submitted' },
                  answers: studentAnswers 
              }
          });
          errorEmitter.emit('permission-error', permissionError);
          setIsSubmitting(false); // Allow retry
      });
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


  if (isLoadingExam || isExamDataLoading) {
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
              <p className="text-muted-foreground mt-2">Your responses have been recorded for manual grading. You may now close this window.</p>
          </div>
      )
  }

  if (!selectedExam) {
       return (
           <div className="fixed inset-0 bg-background flex justify-center items-center">
              <h1 className="text-2xl font-bold text-destructive">Error: Could not load the exam.</h1>
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

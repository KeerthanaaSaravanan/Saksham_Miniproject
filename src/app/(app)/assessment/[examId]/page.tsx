'use client';

import {
  useToast,
} from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, doc, Timestamp, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { ExamLayout } from '@/components/layout/exam-layout';
import { useDoc } from '@/firebase/firestore/use-doc';

// Matches the Firestore data structure
type Exam = {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
    startTime: Timestamp;
    durationMinutes?: number;
};

export type AssessmentQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  type?: 'mcq' | 'fillup' | 'short-answer' | 'long-answer';
};

export type SelectedExamDetails = Exam & {
    questions: AssessmentQuestion[];
}

export default function AssessmentPage({ params }: { params: { examId: string }}) {
  const [selectedExam, setSelectedExam] = useState<SelectedExamDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExam, setIsLoadingExam] = useState(true);
  const { toast } = useToast();
  
  const { user } = useUser();
  const firestore = useFirestore();

  const examRef = useMemo(() => {
    if (!firestore || !params.examId) return null;
    return doc(firestore, 'exams', params.examId);
  }, [firestore, params.examId]);

  const { data: examData, isLoading: isExamDataLoading } = useDoc<Exam>(examRef);

  useEffect(() => {
    // Enter fullscreen when component mounts
    document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });

    // Exit fullscreen when component unmounts
    return () => {
        if(document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
        if (!examData || !firestore) return;

        try {
            const questionsQuery = collection(firestore, 'exams', examData.id, 'questions');
            const querySnapshot = await getDocs(questionsQuery);
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

    let correctCount = 0;
    const studentAnswers = Object.entries(answers).map(([questionId, answer]) => {
      const question = selectedExam.questions.find(q => q.id === questionId);
      const isCorrect = question ? question.correctAnswer.toLowerCase().trim() === answer.toLowerCase().trim() : false;
      if (isCorrect) correctCount++;
      return {
        questionId,
        answer,
        isCorrect,
        studentExamAttemptId: attemptRef.id,
      };
    });
    
    studentAnswers.forEach(ans => {
        const answerRef = doc(answersCollectionRef);
        batch.set(answerRef, ans);
    });

    const score = (correctCount / selectedExam.questions.length) * 100;
    batch.set(attemptRef, {
        userId: user.uid,
        examId: selectedExam.id,
        startTime: new Date(),
        endTime: serverTimestamp(),
        score: score,
        status: 'submitted',
    });

    try {
        await batch.commit();
        toast({
            title: "Exam Submitted Successfully",
            description: `Your answers have been saved. You can now close this tab.`
        });
        // We can't close the tab automatically due to browser security
        // So we can replace the UI.
        setIsSubmitting(true); 
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: attemptRef.path,
            operation: 'write',
            requestResourceData: { attempt: 'data', answers: 'data' }
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSubmitting(false); // Allow retry
    }
  }, [isSubmitting, selectedExam, user, firestore, toast]);
  

  if (isLoadingExam || isExamDataLoading) {
      return (
          <div className="fixed inset-0 bg-background flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Loading Exam...</p>
          </div>
      )
  }

  if (isSubmitting) {
      return (
           <div className="fixed inset-0 bg-background flex justify-center items-center">
              <h1 className="text-2xl font-bold">Exam Submitted. You may close this tab.</h1>
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

  return (
    <ExamLayout 
        exam={selectedExam}
        onTimeUp={handleSubmitExam}
        isSubmitting={isSubmitting}
    />
  );
}

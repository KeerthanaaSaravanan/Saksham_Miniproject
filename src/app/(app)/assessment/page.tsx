'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, getDoc, doc, Timestamp, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
import { ExamLayout } from '@/components/layout/exam-layout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


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

export default function AssessmentPage() {
  const [selectedExam, setSelectedExam] = useState<SelectedExamDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExam, setIsLoadingExam] = useState(false);
  const [examToConfirm, setExamToConfirm] = useState<Exam | null>(null);
  const { toast } = useToast();
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [grade, setGrade] = useState('');

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
        isCorrect, // Note: this is for potential auto-grading, but faculty will review
        studentExamAttemptId: attemptRef.id,
      };
    });
    
    // Save each answer
    studentAnswers.forEach(ans => {
        const answerRef = doc(answersCollectionRef);
        batch.set(answerRef, ans);
    });

    // Save the overall attempt
    const score = (correctCount / selectedExam.questions.length) * 100;
    batch.set(attemptRef, {
        userId: user.uid,
        examId: selectedExam.id,
        startTime: new Date(), // This should ideally be when the exam started
        endTime: serverTimestamp(),
        score: score, // This might be a provisional score
        status: 'submitted', // For faculty review
    });

    try {
        await batch.commit();
        toast({
            title: "Exam Submitted Successfully",
            description: `Your answers have been saved and sent for review.`
        });
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: attemptRef.path,
            operation: 'write',
            requestResourceData: { attempt: 'data', answers: 'data' }
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
        setSelectedExam(null);
        setIsSubmitting(false);
    }
  }, [isSubmitting, selectedExam, user, firestore, toast]);
  

  useEffect(() => {
    if (user && firestore) {
      const fetchUserProfile = async () => {
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              setGrade(userDocSnap.data().grade || '');
            }
        } catch (error: any) {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
      };
      fetchUserProfile();
    }
  }, [user, firestore]);

  const examsQuery = useMemoFirebase(() => {
    if (!firestore || !grade) return null;
    return query(
      collection(firestore, 'exams'),
      where('gradeLevel', '==', grade)
    );
  }, [firestore, grade]);

  const { data: availableExams, isLoading: areExamsLoading } = useCollection<Exam>(examsQuery);

  const handleStartExam = async (exam: Exam) => {
    if (!firestore) return;
    setExamToConfirm(null);
    setIsLoadingExam(true);
    toast({ title: `Loading Exam: ${exam.title}` });

    try {
        const questionsQuery = collection(firestore, 'exams', exam.id, 'questions');
        const querySnapshot = await getDocs(questionsQuery);
        const questions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            question: doc.data().question,
            options: doc.data().options,
            correctAnswer: doc.data().correctAnswer,
            type: doc.data().type || 'mcq', // default to mcq
        })) as AssessmentQuestion[];

        setSelectedExam({ ...exam, questions });
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
            path: `exams/${exam.id}/questions`,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
        setIsLoadingExam(false);
    }
  }

  const handleBackToDashboard = () => {
    setSelectedExam(null);
  }

  if (isLoadingExam) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  if (selectedExam) {
    return (
        <ExamLayout 
            exam={selectedExam}
            onTimeUp={handleSubmitExam}
            onExit={handleBackToDashboard}
            isSubmitting={isSubmitting}
        />
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
              <h1 className="text-3xl font-bold font-headline">My Exams</h1>
              <p className="text-muted-foreground">
                  Available examinations for your grade level.
              </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areExamsLoading || isUserLoading ? (
              <>
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-48 w-full" />
              </>
          ) : availableExams && availableExams.length > 0 ? (
              availableExams.map(exam => (
                  <Card key={exam.id}>
                      <CardHeader>
                          <CardTitle className="text-xl">{exam.title}</CardTitle>
                          <CardDescription>{exam.subject} | {exam.gradeLevel}</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <div className="flex items-center text-sm text-muted-foreground">
                              <BookOpen className="mr-2 h-4 w-4" />
                              <span>Starts: {exam.startTime.toDate().toLocaleString()}</span>
                          </div>
                      </CardContent>
                      <CardFooter>
                          <Button className="w-full" onClick={() => setExamToConfirm(exam)}>
                              Start Exam
                          </Button>
                      </CardFooter>
                  </Card>
              ))
          ) : (
              <p className="col-span-full text-center text-muted-foreground mt-8">No exams are scheduled for you at this time.</p>
          )}
        </div>
      </div>
      
      {examToConfirm && (
        <AlertDialog open onOpenChange={() => setExamToConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start Attempt: {examToConfirm.title}</AlertDialogTitle>
              <AlertDialogDescription>
                Your attempt will have a time limit of {examToConfirm.durationMinutes || 60} minutes. 
                When you start, the timer will begin to count down and cannot be paused. 
                You must finish your attempt before it expires.
                <br /><br />
                Are you sure you wish to start now?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStartExam(examToConfirm)}>Start attempt</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

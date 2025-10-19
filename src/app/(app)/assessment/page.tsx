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
import { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, query, where, getDoc, doc, Timestamp } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function AssessmentListPage() {
  const [examToConfirm, setExamToConfirm] = useState<Exam | null>(null);
  const { toast } = useToast();
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [grade, setGrade] = useState('');

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

  const handleStartExam = (examId: string) => {
    setExamToConfirm(null);
    // Open the dedicated exam page in a new tab
    window.open(`/assessment/${examId}`, '_blank', 'noopener,noreferrer');
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
              <AlertDialogTitle>Start attempt</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Time limit</h3>
                  <p>Your attempt will have a time limit of {examToConfirm.durationMinutes || 60} minutes. When you start, the timer will begin to count down and cannot be paused. You must finish your attempt before it expires.</p>
                  <p>Are you sure you wish to start now?</p>
                   <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-xs text-destructive/90">
                        <strong className="font-semibold">Proctoring Warning:</strong> This exam will open in a new, fullscreen tab. Leaving the exam tab or window is not permitted and will cause your exam to be submitted automatically.
                      </p>
                   </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStartExam(examToConfirm.id)}>Start attempt</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

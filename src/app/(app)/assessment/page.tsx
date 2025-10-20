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
import { Clock, BookOpen } from 'lucide-react';
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
    endTime: Timestamp;
    durationMinutes?: number;
};

export default function AssessmentListPage() {
  const [examToConfirm, setExamToConfirm] = useState<Exam | null>(null);
  const { toast } = useToast();
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [grade, setGrade] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    if (user && firestore) {
      const fetchUserProfile = async () => {
        setIsProfileLoading(true);
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              setGrade(userDocSnap.data().grade || '');
            } else {
              toast({ variant: 'destructive', title: 'Profile Not Found', description: 'Please complete your profile in settings.'})
            }
        } catch (error: any) {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setIsProfileLoading(false);
        }
      };
      fetchUserProfile();
    } else if (!isUserLoading) {
      setIsProfileLoading(false);
    }
  }, [user, firestore, isUserLoading, toast]);

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

  const isLoading = areExamsLoading || isUserLoading || isProfileLoading;

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
          {isLoading ? (
              <>
                  <Skeleton className="h-56 w-full" />
                  <Skeleton className="h-56 w-full" />
                  <Skeleton className="h-56 w-full" />
              </>
          ) : availableExams && availableExams.length > 0 ? (
              availableExams.map(exam => (
                  <Card key={exam.id} className="flex flex-col cursor-pointer hover:border-primary transition-colors" onClick={() => setExamToConfirm(exam)}>
                      <CardHeader>
                          <CardTitle className="text-xl">{exam.title}</CardTitle>
                          <CardDescription>{exam.subject} | {exam.gradeLevel}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-2">
                           <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-2 h-4 w-4" />
                              <span>Duration: {exam.durationMinutes || 'N/A'} minutes</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                              <BookOpen className="mr-2 h-4 w-4" />
                              <span>Starts: {exam.startTime.toDate().toLocaleString()}</span>
                          </div>
                      </CardContent>
                      <CardFooter>
                          <Button className="w-full">
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
              <AlertDialogTitle>Start "{examToConfirm.title}"?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4 pt-2">
                  <p className="font-semibold">Please read the following instructions carefully:</p>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>The exam will have a time limit of <strong className="text-foreground">{examToConfirm.durationMinutes || 60} minutes</strong>.</li>
                    <li>The timer will start immediately and cannot be paused.</li>
                    <li>This exam will open in a new, fullscreen window.</li>
                    <li><strong className="text-destructive">Leaving the exam tab or window is not permitted and will cause your exam to be submitted automatically.</strong></li>
                  </ul>
                   <p className="font-semibold pt-2">Are you sure you wish to start now?</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStartExam(examToConfirm.id)}>Start Exam</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

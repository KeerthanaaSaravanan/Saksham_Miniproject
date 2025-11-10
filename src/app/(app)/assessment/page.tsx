
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
import { Clock, BookOpen, CheckCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
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
import { useRouter } from 'next/navigation';
import { collection, query, where } from 'firebase/firestore';
import type { WithId } from '@/firebase';


type Exam = WithId<{
    title: string;
    subject: string;
    gradeLevel: string;
    startTime: { seconds: number; nanoseconds: number };
    endTime: { seconds: number; nanoseconds: number };
    durationMinutes?: number;
}>;


export default function AssessmentListPage() {
  const [examToConfirm, setExamToConfirm] = useState<Exam | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const userProfileRef = useMemoFirebase(() => user && firestore && doc(firestore, 'users', user.uid), [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{gradeLevel: string}>(userProfileRef);

  const gradeLevel = userProfile?.gradeLevel;

  const examsQuery = useMemoFirebase(() => 
      firestore && gradeLevel && query(collection(firestore, 'exams'), where('gradeLevel', '==', gradeLevel))
  , [firestore, gradeLevel]);
  const { data: allExams, isLoading: areExamsLoading } = useCollection<Exam>(examsQuery);
  
  const attemptsQuery = useMemoFirebase(() => 
      firestore && user && query(collection(firestore, 'submissions'), where('userId', '==', user.uid))
  , [firestore, user]);
  const { data: attemptsData, isLoading: areAttemptsLoading } = useCollection<{examId: string}>(attemptsQuery);
  const attempts = useMemo(() => new Set(attemptsData?.map(a => a.examId)), [attemptsData]);

  
  const availableExams = useMemo(() => {
    if (!allExams) return [];
    return allExams.filter(exam => !attempts.has(exam.id) && new Date(exam.startTime.seconds * 1000) > new Date());
  }, [allExams, attempts]);
  
  const completedExams = useMemo(() => {
      if (!allExams) return [];
      return allExams.filter(exam => attempts.has(exam.id));
  }, [allExams, attempts]);

  const handleStartExam = (examId: string) => {
    setExamToConfirm(null);
    router.push(`/assessment/${examId}`);
  }

  const pageIsLoading = areExamsLoading || isUserLoading || isProfileLoading || areAttemptsLoading;

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Exams</h1>
          <p className="text-muted-foreground">
              Available examinations for your grade level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageIsLoading ? (
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
                              <span>Starts: {new Date(exam.startTime.seconds * 1000).toLocaleString()}</span>
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
              <p className="col-span-full text-center text-muted-foreground mt-8">No new exams are scheduled for you at this time.</p>
          )}
        </div>
        
        {completedExams.length > 0 && (
            <div className="mt-12">
                <h2 className="text-2xl font-bold font-headline mb-4">Completed Exams</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedExams.map(exam => (
                         <Card key={exam.id} className="flex flex-col bg-muted/50 border-dashed">
                             <CardHeader>
                                 <CardTitle className="text-xl text-muted-foreground">{exam.title}</CardTitle>
                                 <CardDescription>{exam.subject} | {exam.gradeLevel}</CardDescription>
                             </CardHeader>
                             <CardContent className="flex-grow space-y-2">
                                <p className="text-sm text-muted-foreground">You have already completed this exam.</p>
                             </CardContent>
                             <CardFooter>
                                <Button className="w-full" disabled variant="secondary">
                                    <CheckCircle className="mr-2 h-4 w-4"/>
                                     Attempted
                                 </Button>
                             </CardFooter>
                         </Card>
                    ))}
                </div>
            </div>
        )}
        
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
                    <li>The timer will start immediately after you enter fullscreen and cannot be paused.</li>
                    <li>This exam must be taken in fullscreen mode.</li>
                    <li><strong className="text-destructive">Leaving fullscreen or the exam tab is not permitted and will cause your exam to be submitted automatically after one warning.</strong></li>
                  </ul>
                   <p className="font-semibold pt-2">Are you sure you wish to start now?</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStartExam(examToConfirm.id)}>Proceed</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

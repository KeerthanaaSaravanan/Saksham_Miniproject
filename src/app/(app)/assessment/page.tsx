
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
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

type Exam = {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
    startTime: { toDate: () => Date };
    endTime: { toDate: () => Date };
    durationMinutes?: number;
};

export default function AssessmentListPage() {
  const [examToConfirm, setExamToConfirm] = useState<Exam | null>(null);
  const router = useRouter();
  
  const { user, isUserLoading } = useUser();
  const db = useFirestore();

  // Fetch the user's profile to get their grade level
  const userProfileQuery = useMemoFirebase(() => db && user ? query(collection(db, 'users'), where('id', '==', user.uid)) : null, [db, user]);
  const { data: userProfileData, isLoading: isProfileLoading } = useCollection<any>(userProfileQuery);
  const userProfile = userProfileData?.[0];
  const gradeLevel = userProfile?.gradeLevel;

  // Fetch exams for the user's grade level that have not ended yet
  const examsQuery = useMemoFirebase(() => {
    if (!db || !gradeLevel) return null;
    return query(collection(db, 'exams'), where('gradeLevel', '==', gradeLevel), where('endTime', '>', new Date()));
  }, [db, gradeLevel]);
  const { data: allExams, isLoading: areExamsLoading } = useCollection<Exam>(examsQuery);
  
  // Fetch the user's submissions to know which exams they've attempted
  const attemptsQuery = useMemoFirebase(() => db && user ? query(collection(db, 'submissions'), where('studentId', '==', user.uid)) : null, [db, user]);
  const { data: attemptsData, isLoading: areAttemptsLoading } = useCollection<{ examId: string }>(attemptsQuery);
  const attemptedExamIds = useMemo(() => new Set(attemptsData?.map(a => a.examId) || []), [attemptsData]);

  
  const availableExams = useMemo(() => {
    if (!allExams) return [];
    return allExams.filter(exam => 
        !attemptedExamIds.has(exam.id) &&
        exam.startTime.toDate() < new Date() // Exam has started
    );
  }, [allExams, attemptedExamIds]);
  
  const completedExams = useMemo(() => {
      if (!allExams) return [];
      return allExams.filter(exam => attemptedExamIds.has(exam.id));
  }, [allExams, attemptedExamIds]);

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

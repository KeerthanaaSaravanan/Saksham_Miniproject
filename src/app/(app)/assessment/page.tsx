
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
import { useUser } from '@/firebase';
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

const MOCK_PROFILE = {
    gradeLevel: 'Class 8',
};

const MOCK_EXAMS: Exam[] = [
    { id: 'exam1', title: 'Mid-Term Social Studies', subject: 'Social Studies', gradeLevel: 'Class 8', startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), endTime: new Date(), durationMinutes: 90},
    { id: 'exam2', title: 'Annual Physics Exam', subject: 'Physics', gradeLevel: 'Class 11', startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), endTime: new Date(), durationMinutes: 180 },
    { id: 'exam3', title: 'Completed History Exam', subject: 'History', gradeLevel: 'Class 8', startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), endTime: new Date(), durationMinutes: 120 },
];

const MOCK_ATTEMPTS = ['exam3'];


export default function AssessmentListPage() {
  const [examToConfirm, setExamToConfirm] = useState<Exam | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  const { user, isUserLoading } = useUser();
  const [gradeLevel, setGradeLevel] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsProfileLoading(true);
    setIsLoading(true);
    // Simulate fetching user profile
    setTimeout(() => {
        if(user) {
            setGradeLevel(MOCK_PROFILE.gradeLevel);
        }
        setIsProfileLoading(false);
    }, 500);
    
    // Simulate fetching exams and attempts
    setTimeout(() => {
        setAllExams(MOCK_EXAMS);
        setAttempts(MOCK_ATTEMPTS);
        setIsLoading(false);
    }, 1000);

  }, [user]);

  
  const availableExams = useMemo(() => {
    if (!gradeLevel) return [];
    return allExams.filter(exam => exam.gradeLevel === gradeLevel && !attempts.includes(exam.id));
  }, [allExams, attempts, gradeLevel]);
  
  const completedExams = useMemo(() => {
      if (!gradeLevel) return [];
      return allExams.filter(exam => exam.gradeLevel === gradeLevel && attempts.includes(exam.id));
  }, [allExams, attempts, gradeLevel]);

  const handleStartExam = (examId: string) => {
    setExamToConfirm(null);
    router.push(`/assessment/${examId}`);
  }

  const pageIsLoading = isLoading || isUserLoading || isProfileLoading;

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
                              <span>Starts: {exam.startTime.toLocaleString()}</span>
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

    
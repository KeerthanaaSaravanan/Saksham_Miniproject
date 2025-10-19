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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDoc, doc, Timestamp, getDocs } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { Skeleton } from '@/components/ui/skeleton';

// Matches the Firestore data structure
type Exam = {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
    startTime: Timestamp;
};

type AssessmentQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: string; // `correctAnswer` in Firestore
};

type SelectedExamDetails = Exam & {
    questions: AssessmentQuestion[];
}

export default function AssessmentPage() {
  const [selectedExam, setSelectedExam] = useState<SelectedExamDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExam, setIsLoadingExam] = useState(false);
  const { toast } = useToast();
  
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [grade, setGrade] = useState('');

  useEffect(() => {
    if (user && firestore) {
      const fetchUserProfile = async () => {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setGrade(userDocSnap.data().grade || '');
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
    setIsLoadingExam(true);
    toast({ title: `Loading Exam: ${exam.title}` });

    try {
        const questionsQuery = collection(firestore, 'exams', exam.id, 'questions');
        const querySnapshot = await getDocs(questionsQuery);
        const questions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            question: doc.data().question,
            options: doc.data().options,
            answer: doc.data().correctAnswer,
        })) as AssessmentQuestion[];

        setSelectedExam({ ...exam, questions });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Failed to load exam', description: error.message });
        console.error("Error loading questions: ", error);
    } finally {
        setIsLoadingExam(false);
    }
  }
  
  const handleSubmitExam = () => {
    setIsSubmitting(true);
    // In a real app, you would submit answers to the backend for grading
    setTimeout(() => {
        toast({
            title: "Exam Submitted",
            description: "Your answers have been recorded. Results will be available soon."
        });
        setSelectedExam(null);
        setIsSubmitting(false);
    }, 1500);
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
        <div className="space-y-6">
            <Button variant="outline" onClick={() => setSelectedExam(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Exams
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>{selectedExam.title}</CardTitle>
                    <CardDescription>Subject: {selectedExam.subject} | Grade: {selectedExam.gradeLevel}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {selectedExam.questions.map((q, index) => (
                        <div key={q.id}>
                            <h3 className="font-semibold">{index + 1}. {q.question}</h3>
                            <RadioGroup className="mt-4 space-y-2">
                            {q.options.filter(opt => opt).map((option, i) => (
                                <div key={i} className="flex items-center space-x-3 space-y-0">
                                <RadioGroupItem value={option} id={`q${index}-o${i}`} />
                                <Label htmlFor={`q${index}-o${i}`} className="font-normal">
                                    {option}
                                </Label>
                                </div>
                            ))}
                            </RadioGroup>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="gap-2">
                    <Button onClick={handleSubmitExam} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Submit Exam
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
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
                        <Button className="w-full" onClick={() => handleStartExam(exam)}>
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
  );
}

    
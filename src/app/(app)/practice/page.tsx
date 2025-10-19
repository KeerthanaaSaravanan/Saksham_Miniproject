'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createPracticeExam } from '@/lib/actions/practice-exam';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { ExamLayout } from '@/components/layout/exam-layout';
import type { SelectedExamDetails, AssessmentQuestion } from '@/app/(app)/assessment/[examId]/page';
import { useRouter } from 'next/navigation';
import { PracticeResults } from '@/components/PracticeResults';
import type { PracticeHistoryEntry } from '@/components/PracticeResults';


const formSchema = z.object({
  subject: z.string().min(2, 'Subject must be at least 2 characters.'),
  lesson: z.string().min(2, 'Lesson must be at least 2 characters.'),
  questionType: z.string().min(1, 'Question type is required.'),
  questionCount: z.coerce.number().min(1, 'Must have at least 1 question.').max(20, 'Cannot exceed 20 questions.'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute.').max(120, 'Duration cannot exceed 120 minutes.'),
});


type Result = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

export default function PracticePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [exam, setExam] = useState<SelectedExamDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<PracticeHistoryEntry[]>([]);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const savedHistory = localStorage.getItem('practiceHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Could not load practice history from localStorage", error);
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: 'Physics',
      lesson: 'Laws of Motion',
      questionType: 'mcq',
      questionCount: 5,
      duration: 10,
    },
  });

  async function onGenerate(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setExam(null);

    const result = await createPracticeExam(values);
    
    if ('error' in result) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: result.error });
      setIsLoading(false);
    } else {
      const generatedQuestions: AssessmentQuestion[] = result.exam.map((q: any, index: number) => ({
        id: `practice-${index}`,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        type: q.type,
      }));

      const examDetails: SelectedExamDetails = {
        id: `practice-${Date.now()}`,
        title: `Practice: ${values.subject}`,
        subject: values.lesson,
        gradeLevel: 'Practice',
        startTime: new Date() as any,
        durationMinutes: values.duration,
        questions: generatedQuestions,
      };

      setExam(examDetails);
      toast({ title: 'Practice Exam Generated', description: 'Your exam is ready to start.' });
      setIsLoading(false);
    }
  }
  
  const handleSubmitAnswers = useCallback(async (answers: Record<string, string>) => {
    if (!exam || isSubmitting) return;
    setIsSubmitting(true);
    toast({ title: "Grading your exam..." });

    const newResults: Result[] = exam.questions.map((q) => {
        const userAnswer = answers[q.id] || '';
        const isCorrect = q.correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
        return {
            question: q.question,
            userAnswer,
            correctAnswer: q.correctAnswer,
            isCorrect
        };
    });

    try {
        const existingHistoryJSON = localStorage.getItem('practiceHistory');
        const existingHistory = existingHistoryJSON ? JSON.parse(existingHistoryJSON) : [];
        const newHistoryEntry = {
            id: exam.id,
            title: exam.title,
            subject: exam.subject,
            date: new Date().toISOString(),
            score: (newResults.filter(r => r.isCorrect).length / newResults.length) * 100,
            results: newResults,
        };
        const updatedHistory = [newHistoryEntry, ...existingHistory];
        localStorage.setItem('practiceHistory', JSON.stringify(updatedHistory));
        setHistory(updatedHistory);
        
        toast({ title: "Exam Submitted!", description: "Your results have been saved." });
        setExam(null);
        router.refresh();

    } catch (error) {
        console.error("Failed to save to localStorage", error);
        toast({ variant: 'destructive', title: "Save Failed", description: "Could not save your results." });
    } finally {
        setIsSubmitting(false);
    }
  }, [exam, isSubmitting, toast, router]);


  if (exam) {
    return (
        <ExamLayout 
            exam={exam}
            onTimeUp={handleSubmitAnswers}
            isSubmitting={isSubmitting}
        />
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold font-headline">AI Practice Zone</h1>
            <p className="text-muted-foreground">
              Generate custom exams to sharpen your skills.
            </p>
          </div>
        </div>

        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onGenerate)}>
              <CardHeader>
                <CardTitle>Create a Practice Exam</CardTitle>
                <CardDescription>
                  Let AI build a tailored practice session for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="subject" render={({ field }) => (
                        <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="e.g., Biology" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="lesson" render={({ field }) => (
                        <FormItem><FormLabel>Lesson / Topic</FormLabel><FormControl><Input placeholder="e.g., Cell Structure" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="questionType" render={({ field }) => (
                        <FormItem><FormLabel>Question Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl><SelectContent>
                                    <SelectItem value="mcq">Multiple Choice</SelectItem>
                                    <SelectItem value="fillup">Fill in the Blanks</SelectItem>
                                    <SelectItem value="short-answer">Short Answer</SelectItem>
                                    <SelectItem value="long-answer">Long Answer</SelectItem>
                                </SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="questionCount" render={({ field }) => (
                        <FormItem><FormLabel>Number of Questions</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="duration" render={({ field }) => (
                        <FormItem><FormLabel>Time (minutes)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Generating...' : 'Generate Exam'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      <div className="mt-12">
        <PracticeResults history={history} isClient={isClient} />
      </div>
    </div>
  );
}

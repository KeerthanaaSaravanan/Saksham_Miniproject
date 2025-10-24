
'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
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
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { createPracticeExam } from '@/lib/actions/practice-exam';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { ExamLayout } from '@/components/layout/exam-layout';
import type { SelectedExamDetails, AssessmentQuestion } from '@/app/(app)/assessment/[examId]/page';
import { useRouter, useSearchParams } from 'next/navigation';
import { PracticeResults } from '@/components/PracticeResults';
import type { PracticeHistoryEntry } from '@/components/PracticeResults';

const questionTypes = [
  { id: 'mcq', label: 'Multiple Choice' },
  { id: 'fillup', label: 'Fill in the Blanks' },
  { id: 'short-answer', label: 'Short Answer' },
  { id: 'long-answer', label: 'Long Answer' },
] as const;


const formSchema = z.object({
  subject: z.string().min(2, 'Subject must be at least 2 characters.'),
  lesson: z.string().min(2, 'Lesson must be at least 2 characters.'),
  questionTypes: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one question type.",
  }),
  numberOfQuestions: z.coerce.number().min(1, 'Must be at least 1 question.').max(50, 'Cannot exceed 50 questions.'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute.').max(180, 'Duration cannot exceed 180 minutes.'),
});


type Result = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
};

function PracticePageComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [exam, setExam] = useState<SelectedExamDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<PracticeHistoryEntry[]>([]);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      lesson: '',
      questionTypes: ['mcq'],
      numberOfQuestions: 10,
      duration: 15,
    },
  });

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

    const subjectFromQuery = searchParams.get('subject');
    if (subjectFromQuery) {
        form.setValue('subject', subjectFromQuery);
        form.setValue('lesson', ''); // Clear lesson when subject changes
    } else {
       form.reset({
          subject: 'Physics',
          lesson: 'Laws of Motion',
          questionTypes: ['mcq'],
          numberOfQuestions: 10,
          duration: 15,
        });
    }
  }, [searchParams, form]);


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
        explanation: q.explanation,
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
            isCorrect,
            explanation: q.explanation || "No explanation provided.",
        };
    });

    try {
        const existingHistoryJSON = localStorage.getItem('practiceHistory');
        const existingHistory = existingHistoryJSON ? JSON.parse(existingHistoryJSON) : [];
        const newHistoryEntry: PracticeHistoryEntry = {
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
        router.push('/practice'); // Go back to practice page

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
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="subject" render={({ field }) => (
                        <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="e.g., Biology" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="lesson" render={({ field }) => (
                        <FormItem><FormLabel>Lesson / Topic</FormLabel><FormControl><Input placeholder="e.g., Cell Structure" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <FormField
                  control={form.control}
                  name="questionTypes"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Question Types</FormLabel>
                        <FormDescription>
                          Select one or more types of questions to include in the exam.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {questionTypes.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="questionTypes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="numberOfQuestions" render={({ field }) => (
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

export default function PracticePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PracticePageComponent />
        </Suspense>
    )
}

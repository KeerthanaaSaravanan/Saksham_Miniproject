'use client';

import { useState, useCallback } from 'react';
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
import { Loader2, Sparkles, Check, X } from 'lucide-react';
import { ExamLayout } from '@/components/layout/exam-layout';
import type { SelectedExamDetails, AssessmentQuestion } from '@/app/(app)/assessment/page';

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
  const [results, setResults] = useState<Result[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

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
    setResults(null);

    const result = await createPracticeExam(values);
    
    if ('error' in result) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: result.error });
      setIsLoading(false);
    } else {
      // Adapt the AI-generated questions to the SelectedExamDetails format
      const generatedQuestions: AssessmentQuestion[] = result.exam.map((q: any, index: number) => ({
        id: `practice-${index}`,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        type: q.type,
      }));

      const examDetails: SelectedExamDetails = {
        id: 'practice-exam',
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

    // Perform auto-correction on the client-side
    const newResults = exam.questions.map((q) => {
        const userAnswer = answers[q.id] || '';
        const isCorrect = q.correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
        return {
            question: q.question,
            userAnswer,
            correctAnswer: q.correctAnswer,
            isCorrect
        };
    });
    
    setResults(newResults);
    setExam(null); // Exit exam mode
    setIsSubmitting(false);
    toast({ title: "Exam Submitted!", description: "Your results are ready." });
  }, [exam, isSubmitting, toast]);


  if (exam) {
    return (
        <ExamLayout 
            exam={exam}
            onTimeUp={handleSubmitAnswers}
            onExit={() => { setExam(null); setResults(null); }}
            isSubmitting={isSubmitting}
        />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">AI Practice Zone</h1>
          <p className="text-muted-foreground">
            Generate custom exams to sharpen your skills.
          </p>
        </div>
      </div>

      {!results && (
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
      )}
      
      {results && (
        <Card>
            <CardHeader>
                <CardTitle>Practice Results</CardTitle>
                <CardDescription>
                    You scored {results.filter(r => r.isCorrect).length} out of {results.length}.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {results.map((result, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-muted/50">
                        <p className="font-semibold">{index + 1}. {result.question}</p>
                        <div className={`mt-2 flex items-start gap-3 p-2 rounded-md ${result.isCorrect ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                            {result.isCorrect ? <Check className="h-5 w-5 text-green-600 mt-1" /> : <X className="h-5 w-5 text-destructive mt-1" />}
                            <div>
                                <p className="text-sm">Your answer: <span className="font-medium">{result.userAnswer || "No answer provided"}</span></p>
                                {!result.isCorrect && <p className="text-sm">Correct answer: <span className="font-medium text-green-700 dark:text-green-500">{result.correctAnswer}</span></p>}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                <Button onClick={() => { setResults(null); }}>Take Another Practice Exam</Button>
            </CardFooter>
        </Card>
      )}

    </div>
  );
}

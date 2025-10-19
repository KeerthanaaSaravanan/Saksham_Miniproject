'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
  FormDescription,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { createPracticeExam } from '@/lib/actions/practice-exam';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BrainCircuit, Sparkles, Check, X } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  subject: z.string().min(2, 'Subject must be at least 2 characters.'),
  lesson: z.string().min(2, 'Lesson must be at least 2 characters.'),
  questionType: z.string().min(1, 'Question type is required.'),
  questionCount: z.coerce.number().min(1, 'Must have at least 1 question.').max(20, 'Cannot exceed 20 questions.'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute.').max(120, 'Duration cannot exceed 120 minutes.'),
});

type Question = {
  question: string;
  type: 'mcq' | 'fillup' | 'short-answer' | 'long-answer';
  options?: string[];
  correctAnswer: string;
};

type Result = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

const answerSchema = z.object({
    answers: z.array(z.object({ value: z.string() }))
});

export default function PracticePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [exam, setExam] = useState<{ questions: Question[], originalRequest: z.infer<typeof formSchema> } | null>(null);
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

  const answerForm = useForm<z.infer<typeof answerSchema>>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      answers: [],
    },
  });

  const { fields } = useFieldArray({
    control: answerForm.control,
    name: "answers"
  });

  async function onGenerate(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setExam(null);
    setResults(null);

    const result = await createPracticeExam(values);
    
    if ('error' in result) {
      toast({ variant: 'destructive', title: 'Generation Failed', description: result.error });
    } else {
      setExam({ questions: result.exam, originalRequest: values });
      answerForm.reset({ answers: result.exam.map(() => ({ value: '' }))});
      toast({ title: 'Practice Exam Generated', description: 'Your exam is ready to start.' });
    }
    setIsLoading(false);
  }
  
  async function onSubmitAnswers(data: z.infer<typeof answerSchema>) {
    if (!exam) return;
    setIsSubmitting(true);
    const userAnswers = data.answers.map(a => a.value);

    // For now, we will perform auto-correction on the client-side
    // In a real app, this might be a separate AI call for more nuanced grading
    const newResults = exam.questions.map((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = q.correctAnswer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
        return {
            question: q.question,
            userAnswer,
            correctAnswer: q.correctAnswer,
            isCorrect
        };
    });
    
    setResults(newResults);
    setExam(null);
    setIsSubmitting(false);
    toast({ title: "Exam Submitted!", description: "Your results are ready." });
  }

  const renderQuestionInput = (question: Question, index: number) => {
    switch(question.type) {
      case 'mcq':
        return (
          <FormField
            control={answerForm.control}
            name={`answers.${index}.value`}
            render={({ field }) => (
              <FormItem className="mt-4 space-y-2">
                <FormControl>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                        {question.options?.map((option, i) => (
                            <FormItem key={i} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value={option} id={`q${index}-o${i}`} />
                                </FormControl>
                                <Label htmlFor={`q${index}-o${i}`} className="font-normal">{option}</Label>
                            </FormItem>
                        ))}
                    </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 'fillup':
      case 'short-answer':
        return (
            <FormField
                control={answerForm.control}
                name={`answers.${index}.value`}
                render={({ field }) => (
                <FormItem className="mt-2">
                    <FormControl><Input {...field} placeholder="Your answer" /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        );
      case 'long-answer':
        return (
            <FormField
                control={answerForm.control}
                name={`answers.${index}.value`}
                render={({ field }) => (
                <FormItem className="mt-2">
                    <FormControl><Textarea {...field} placeholder="Your detailed answer" /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        );
      default:
        return null;
    }
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

      {!exam && !results && (
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

      {exam && (
        <Card>
            <Form {...answerForm}>
                <form onSubmit={answerForm.handleSubmit(onSubmitAnswers)}>
                    <CardHeader>
                        <CardTitle>Practice Exam: {exam.originalRequest.subject}</CardTitle>
                        <CardDescription>Topic: {exam.originalRequest.lesson} | Time Limit: {exam.originalRequest.duration} minutes</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {exam.questions.map((q, index) => (
                            <div key={index}>
                                <h3 className="font-semibold">{index + 1}. {q.question}</h3>
                                {renderQuestionInput(q, index)}
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Submit for Correction
                        </Button>
                        <Button variant="outline" onClick={() => { setExam(null); setResults(null); }}>Start Over</Button>
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
                <Button onClick={() => { setExam(null); setResults(null); }}>Take Another Practice Exam</Button>
            </CardFooter>
        </Card>
      )}

    </div>
  );
}

'use client';

import { useState } from 'react';
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
import { createAssessment } from '@/lib/actions/assessment';
import { detectAnomalies } from '@/lib/actions/fraud-detection';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BrainCircuit, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  learningNeeds: z.string().min(10, 'Please describe learning needs in at least 10 characters.'),
  subject: z.string().min(1, 'Subject is required.'),
  gradeLevel: z.string().min(1, 'Grade level is required.'),
  examLengthMinutes: z.coerce.number().min(5, 'Exam must be at least 5 minutes.').max(180, 'Exam cannot exceed 180 minutes.'),
});

type AssessmentQuestion = {
  question: string;
  options: string[];
  answer: string;
};

export default function AssessmentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [anomalyResult, setAnomalyResult] = useState<any>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      learningNeeds: 'Student has dyslexia and requires larger fonts and more time.',
      subject: 'Science',
      gradeLevel: '8th Grade',
      examLengthMinutes: 30,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAssessment(null);
    setError(null);
    setAnomalyResult(null);

    const result = await createAssessment(values);
    if ('error' in result) {
      setError(result.error);
      toast({
        variant: 'destructive',
        title: 'Assessment Generation Failed',
        description: result.error,
      });
    } else {
      setAssessment(result.assessment.questions);
      toast({
        title: 'Assessment Generated',
        description: 'Your customized exam is ready.',
      });
    }
    setIsLoading(false);
  }
  
  async function handleFraudDetection() {
    setIsDetecting(true);
    setAnomalyResult(null);
    const result = await detectAnomalies({
        examDetails: "8th Grade Science",
        studentDetails: "Student with Dyslexia",
        screenActivityData: JSON.stringify([
            { timestamp: "10:01:05", activity: "Switched to new tab: wikipedia.org" },
            { timestamp: "10:01:15", activity: "Switched back to exam tab" },
        ])
    });

    if ('error' in result) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
        setAnomalyResult(result);
    }
    setIsDetecting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold font-headline">AI Exam Engine</h1>
            <p className="text-muted-foreground">
            Dynamically generate assessments tailored to individual student needs.
            </p>
        </div>
        {assessment && (
            <Button onClick={handleFraudDetection} disabled={isDetecting}>
                {isDetecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                {isDetecting ? 'Analyzing...' : 'Check for Anomalies'}
            </Button>
        )}
      </div>

      {!assessment ? (
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Create a New Assessment</CardTitle>
                <CardDescription>
                  Fill in the details below to generate a new exam with AI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="learningNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning Needs</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., visual impairment, requires audio questions" {...field} />
                      </FormControl>
                      <FormDescription>Describe the student's accessibility requirements.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., History" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Grade Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a grade" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="5th Grade">5th Grade</SelectItem>
                                <SelectItem value="6th Grade">6th Grade</SelectItem>
                                <SelectItem value="7th Grade">7th Grade</SelectItem>
                                <SelectItem value="8th Grade">8th Grade</SelectItem>
                                <SelectItem value="9th Grade">9th Grade</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="examLengthMinutes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Exam Length (minutes)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                  {isLoading ? 'Generating...' : 'Generate Assessment'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      ) : (
        <>
            {anomalyResult && (
                <Alert variant={anomalyResult.anomalousPatternsDetected ? "destructive" : "default"}>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>{anomalyResult.anomalousPatternsDetected ? "Anomaly Detected" : "No Anomalies Detected"}</AlertTitle>
                    <AlertDescription>{anomalyResult.explanation}</AlertDescription>
                </Alert>
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Your Custom Assessment</CardTitle>
                    <CardDescription>Subject: {form.getValues('subject')} | Grade: {form.getValues('gradeLevel')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {assessment.map((q, index) => (
                        <div key={index}>
                            <h3 className="font-semibold">{index + 1}. {q.question}</h3>
                            <RadioGroup className="mt-4 space-y-2">
                            {q.options.map((option, i) => (
                                <FormItem key={i} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value={option} id={`q${index}-o${i}`} />
                                </FormControl>
                                <Label htmlFor={`q${index}-o${i}`} className="font-normal">
                                    {option}
                                </Label>
                                </FormItem>
                            ))}
                            </RadioGroup>
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="gap-2">
                    <Button>Submit Exam</Button>
                    <Button variant="outline" onClick={() => setAssessment(null)}>Create a New Exam</Button>
                </CardFooter>
            </Card>
        </>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Generation Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

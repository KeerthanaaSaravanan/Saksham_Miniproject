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
import { Loader2, BookOpen, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

// Mock data, in a real app this would come from Firestore
const availableExams = [
    { id: 'math101', title: 'Mathematics - Algebra Basics', subject: 'Mathematics', grade: '8th Grade', questions: [
        { question: 'What is 2x + 5 = 15?', options: ['x=5', 'x=10', 'x=2.5'], answer: 'x=5'},
        { question: 'Simplify: 3(x + 2)', options: ['3x + 6', '3x + 2', 'x + 6'], answer: '3x + 6'},
    ]},
    { id: 'sci101', title: 'Science - The Solar System', subject: 'Science', grade: '8th Grade', questions: [
        { question: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter'], answer: 'Mars'},
        { question: 'What is the largest planet in our solar system?', options: ['Saturn', 'Jupiter', 'Neptune'], answer: 'Jupiter'},
    ]},
];

type AssessmentQuestion = {
  question: string;
  options: string[];
  answer: string;
};

type Exam = {
    id: string;
    title: string;
    subject: string;
    grade: string;
    questions: AssessmentQuestion[];
}

export default function AssessmentPage() {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleStartExam = (exam: Exam) => {
    setSelectedExam(exam);
    toast({
      title: `Starting Exam: ${exam.title}`,
    });
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
                    <CardDescription>Subject: {selectedExam.subject} | Grade: {selectedExam.grade}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {selectedExam.questions.map((q, index) => (
                        <div key={index}>
                            <h3 className="font-semibold">{index + 1}. {q.question}</h3>
                            <RadioGroup className="mt-4 space-y-2">
                            {q.options.map((option, i) => (
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
        {availableExams.length > 0 ? (
            availableExams.map(exam => (
                <Card key={exam.id}>
                    <CardHeader>
                        <CardTitle className="text-xl">{exam.title}</CardTitle>
                        <CardDescription>{exam.subject} | {exam.grade}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>{exam.questions.length} questions</span>
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
            <p>No exams are available for you at this time.</p>
        )}
      </div>
    </div>
  );
}

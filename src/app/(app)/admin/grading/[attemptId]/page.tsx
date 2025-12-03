
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft, Save, Sparkles, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { runAutoGrader } from '@/lib/actions/grading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Question = {
    id: string;
    question: string;
    marks: number;
    correctAnswer: string;
};

type Answer = {
    id: string;
    questionId: string;
    answer: string;
};

type Submission = {
    id: string;
    userId: string;
    studentName: string;
    examId: string;
    endTime: Date;
    status: 'Pending' | 'Graded';
    score: number;
};

type UserProfile = {
    id: string;
    displayName: string;
    photoURL: string;
    email: string;
};

type Exam = {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
};

// MOCK DATA
const MOCK_EXAMS: Record<string, Exam> = {
    'exam1': { id: 'exam1', title: 'Mid-Term Social Studies', subject: 'Social Studies', gradeLevel: 'Class 8' },
};

const MOCK_SUBMISSIONS: Record<string, Submission> = {
    'sub1': { id: 'sub1', userId: 'user1', studentName: 'Rohan Mehta', examId: 'exam1', endTime: new Date('2024-07-20T11:25:00'), status: 'Graded', score: 88 },
    'sub2': { id: 'sub2', userId: 'user2', studentName: 'Sania Mirza', examId: 'exam1', endTime: new Date('2024-07-20T11:28:00'), status: 'Pending', score: 0 },
};

const MOCK_STUDENTS: Record<string, UserProfile> = {
    'user1': { id: 'user1', displayName: 'Rohan Mehta', email: 'rohan@example.com', photoURL: 'https://i.pravatar.cc/150?u=user1' },
    'user2': { id: 'user2', displayName: 'Sania Mirza', email: 'sania@example.com', photoURL: 'https://i.pravatar.cc/150?u=user2' },
};

const MOCK_QUESTIONS: Record<string, Question[]> = {
    'exam1': [
        { id: 'q1', question: 'Who was the first President of India?', marks: 10, correctAnswer: 'Dr. Rajendra Prasad' },
        { id: 'q2', question: 'What is the capital of France?', marks: 10, correctAnswer: 'Paris' },
    ]
};

const MOCK_ANSWERS: Record<string, Answer[]> = {
    'sub1': [
        { id: 'ans1', questionId: 'q1', answer: 'Dr. Rajendra Prasad' },
        { id: 'ans2', questionId: 'q2', answer: 'Paris' },
    ],
    'sub2': [
        { id: 'ans1', questionId: 'q1', answer: 'Jawaharlal Nehru' },
        { id: 'ans2', questionId: 'q2', answer: 'London' },
    ]
};

export default function GradingPage() {
    const params = useParams();
    // In this mock, we use the attemptId as the submissionId
    const examId = params.attemptId as string;
    const submissionId = params.attemptId as string; // This is an issue in the original routing, fixing it here
    const router = useRouter();
    const { toast } = useToast();
    
    const [isSaving, setIsSaving] = useState(false);
    const [isAutoGrading, setIsAutoGrading] = useState<Record<string, boolean>>({});
    
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [exam, setExam] = useState<Exam | null>(null);
    const [student, setStudent] = useState<UserProfile | null>(null);
    const [questions, setQuestions] = useState<Question[] | null>(null);
    const [answers, setAnswers] = useState<Answer[] | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);

    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState<Record<string, string>>({});
    const [needsHumanReview, setNeedsHumanReview] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const currentSubmission = MOCK_SUBMISSIONS[submissionId];
            if (currentSubmission) {
                setSubmission(currentSubmission);
                const currentExam = MOCK_EXAMS[currentSubmission.examId];
                setExam(currentExam);
                setStudent(MOCK_STUDENTS[currentSubmission.userId]);
                setQuestions(MOCK_QUESTIONS[currentSubmission.examId]);
                setAnswers(MOCK_ANSWERS[submissionId]);
            }
            setIsLoading(false);
        }, 500);
    }, [submissionId]);

    useEffect(() => {
        if (questions) {
            const initialScores: Record<string, number> = {};
            questions.forEach(q => {
                initialScores[q.id] = 0;
            });
            setScores(initialScores);
        }
    }, [questions]);
    
    const handleAutoGrade = async (question: Question) => {
        const studentAnswer = answers?.find(a => a.questionId === question.id)?.answer;
        if (!studentAnswer) {
            toast({ variant: 'destructive', title: 'No Answer', description: 'Student did not provide an answer for this question.' });
            return;
        }

        setIsAutoGrading(prev => ({...prev, [question.id]: true}));
        
        const result = await runAutoGrader({
            question: question.question,
            correctAnswer: question.correctAnswer,
            studentResponse: studentAnswer,
            maxScore: question.marks,
        });
        
        setIsAutoGrading(prev => ({...prev, [question.id]: false}));

        if ('error' in result) {
            toast({ variant: 'destructive', title: 'Auto-Grade Failed', description: result.error });
        } else {
            setScores(prev => ({...prev, [question.id]: result.score}));
            setFeedback(prev => ({...prev, [question.id]: result.justification}));
            setNeedsHumanReview(prev => ({...prev, [question.id]: result.human_review}));
            toast({ title: 'AI Grading Complete', description: `Suggested score: ${result.score}/${result.max_score}.`});
        }
    }


    const handleSaveGrade = async () => {
        if (!submission || !questions) return;
        setIsSaving(true);
        
        const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
        const obtainedMarks = Object.values(scores).reduce((sum, s) => sum + s, 0);
        const finalScore = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

        try {
            // Mock saving data
            console.log("Mock saving grade:", { submissionId, finalScore, scores, feedback });

            toast({ title: 'Grade Saved!', description: `The submission has been graded with a score of ${finalScore.toFixed(1)}%.` });
            router.push('/admin/examinations');

        } catch (error: any) {
            console.error("Error saving grade:", error);
            toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
        } finally {
            setIsSaving(false);
        }
    }
    
    const totalScore = Object.values(scores).reduce((sum, score) => sum + (Number(score) || 0), 0);
    const maxScore = questions?.reduce((sum, q) => sum + (Number(q.marks) || 0), 0) || 0;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (!submission) {
        return <div>Submission not found.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Examinations
                    </Button>
                    <h1 className="text-3xl font-bold font-headline">Grade Submission</h1>
                    <p className="text-muted-foreground">
                        Review and grade the student's answers for "{exam?.title}".
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Score</p>
                    <p className="text-3xl font-bold">{totalScore} / {maxScore}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={student?.photoURL} />
                            <AvatarFallback>{student?.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{student?.displayName}</CardTitle>
                            <CardDescription>{student?.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                    <div><Badge variant="outline">Submitted: {submission.endTime.toLocaleString()}</Badge></div>
                    <div><Badge variant="outline">Subject: {exam?.subject}</Badge></div>
                    <div><Badge variant="outline">Grade: {exam?.gradeLevel}</Badge></div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {questions?.map((q, index) => {
                    const studentAnswer = answers?.find(a => a.questionId === q.id);
                    const isQuestionAutoGrading = isAutoGrading[q.id];

                    return (
                        <Card key={q.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                                    <Badge>Max Marks: {q.marks}</Badge>
                                </div>
                                <CardDescription>{q.question}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 rounded-md bg-muted border">
                                    <Label className="font-semibold">Student's Answer</Label>
                                    <p className="mt-1 text-foreground">{studentAnswer?.answer || "No answer provided."}</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col items-start gap-4 bg-muted/50 p-4">
                                {needsHumanReview[q.id] && (
                                    <Alert variant="destructive" className="w-full">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Human Review Recommended</AlertTitle>
                                        <AlertDescription>The AI was not confident in its assessment. Please review this answer carefully.</AlertDescription>
                                    </Alert>
                                )}

                                <div className="flex items-start gap-4 w-full flex-col sm:flex-row">
                                    <div className="flex-1 w-full space-y-2">
                                        <Label htmlFor={`feedback-${q.id}`}>Feedback (AI-Assisted)</Label>
                                        <Textarea 
                                            id={`feedback-${q.id}`}
                                            placeholder="Provide constructive feedback..."
                                            value={feedback[q.id] || ''}
                                            onChange={(e) => setFeedback(prev => ({...prev, [q.id]: e.target.value}))}
                                        />
                                    </div>
                                    <div className="w-full sm:w-56 space-y-2">
                                        <Label htmlFor={`score-${q.id}`}>Score Awarded</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id={`score-${q.id}`}
                                                type="number"
                                                max={q.marks}
                                                min={0}
                                                value={scores[q.id] || 0}
                                                onChange={(e) => {
                                                    const newScore = Math.min(q.marks, Math.max(0, Number(e.target.value)));
                                                    setScores(prev => ({ ...prev, [q.id]: newScore }))
                                                }}
                                            />
                                            <Button variant="outline" size="icon" onClick={() => handleAutoGrade(q)} disabled={isQuestionAutoGrading}>
                                                {isQuestionAutoGrading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
            
            <div className="flex justify-end">
                <Button size="lg" onClick={handleSaveGrade} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Final Grade
                </Button>
            </div>
        </div>
    );
}

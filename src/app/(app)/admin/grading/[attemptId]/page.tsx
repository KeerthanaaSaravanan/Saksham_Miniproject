
'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, getDoc, collection, updateDoc, writeBatch } from 'firebase/firestore';

type Question = {
    id: string;
    question: string;
    marks: number;
    correctAnswer: string;
};

type Answer = {
    questionId: string;
    answer: string;
};

type Submission = {
    id: string;
    userId: string;
    examId: string;
    submittedAt: { toDate: () => Date };
    status: 'in_progress' | 'submitted' | 'graded';
    score?: number;
    responses: Answer[];
    feedback?: Record<string, string>;
};

type UserProfile = {
    id: string;
    displayName: string;
    photoURL: string;
    email: string;
    gradeLevel?: string;
};

type Exam = {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
};

export default function GradingPage() {
    const params = useParams();
    const submissionId = params.attemptId as string;
    const router = useRouter();
    const { toast } = useToast();
    const db = useFirestore();
    
    const submissionRef = useMemoFirebase(() => db ? doc(db, 'submissions', submissionId) : null, [db, submissionId]);
    const { data: submission, isLoading: isSubmissionLoading } = useDoc<Submission>(submissionRef);
    
    const [exam, setExam] = useState<Exam | null>(null);
    const [student, setStudent] = useState<UserProfile | null>(null);
    const [questions, setQuestions] = useState<Question[] | null>(null);
    
    const [isDependentDataLoading, setIsDependentDataLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAutoGrading, setIsAutoGrading] = useState<Record<string, boolean>>({});

    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState<Record<string, string>>({});
    const [needsHumanReview, setNeedsHumanReview] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!submission || !db) return;

        const fetchDependentData = async () => {
            setIsDependentDataLoading(true);
            try {
                // Fetch Exam
                const examRef = doc(db, 'exams', submission.examId);
                const examSnap = await getDoc(examRef);
                if (examSnap.exists()) setExam({ id: examSnap.id, ...examSnap.data() } as Exam);

                // Fetch Student
                const studentRef = doc(db, 'users', submission.userId);
                const studentSnap = await getDoc(studentRef);
                if (studentSnap.exists()) setStudent({ id: studentSnap.id, ...studentSnap.data() } as UserProfile);
                
                // Fetch Questions (assuming they are in a subcollection of the exam)
                 const questionsRef = collection(db, 'exams', submission.examId, 'questions');
                 // In a real app, you'd query this collection. For now, we assume questions are part of the exam doc.
                 // This part needs adjustment based on actual schema. Let's assume questions are embedded for now.
                 const examWithQuestionsSnap = await getDoc(examRef);
                 if (examWithQuestionsSnap.exists()) {
                     const examData = examWithQuestionsSnap.data() as any;
                     setQuestions(examData.questions || []);
                     
                     // Initialize scores and feedback from submission if they exist
                     const initialScores: Record<string, number> = {};
                     const initialFeedback: Record<string, string> = submission.feedback || {};
                     examData.questions?.forEach((q: Question) => {
                         initialScores[q.id] = (submission.responses.find(r => r.questionId === q.id) as any)?.score || 0;
                         if (!initialFeedback[q.id]) initialFeedback[q.id] = '';
                     });
                     setScores(initialScores);
                     setFeedback(initialFeedback);
                 }

            } catch (error) {
                console.error("Error fetching dependent data:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load submission details.' });
            }
            setIsDependentDataLoading(false);
        };
        fetchDependentData();
    }, [submission, db, toast]);
    
    const handleAutoGrade = async (question: Question) => {
        const studentAnswer = submission?.responses?.find(a => a.questionId === question.id)?.answer;
        if (!studentAnswer) {
            toast({ variant: 'destructive', title: 'No Answer', description: 'Student did not provide an answer for this question.' });
            return;
        }

        setIsAutoGrading(prev => ({...prev, [question.id]: true}));
        
        try {
            const result = await runAutoGrader({
                question: question.question,
                correctAnswer: question.correctAnswer || '',
                studentResponse: studentAnswer,
                maxScore: question.marks,
            });
            
            if ('error' in result) {
                throw new Error(result.error);
            }
            setScores(prev => ({...prev, [question.id]: result.score}));
            setFeedback(prev => ({...prev, [question.id]: result.justification}));
            setNeedsHumanReview(prev => ({...prev, [question.id]: result.human_review}));
            toast({ title: 'AI Grading Complete', description: `Suggested score: ${result.score}/${result.maxScore}.`});
        
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Auto-Grade Failed', description: error.message });
        } finally {
            setIsAutoGrading(prev => ({...prev, [question.id]: false}));
        }
    }


    const handleSaveGrade = async () => {
        if (!submission || !questions || !submissionRef || !db) return;
        setIsSaving(true);
        
        const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
        const obtainedMarks = Object.values(scores).reduce((sum, s) => sum + s, 0);
        const finalScore = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

        const updatedResponses = submission.responses.map(response => ({
            ...response,
            score: scores[response.questionId] || 0,
        }));

        try {
            const batch = writeBatch(db);
            
            batch.update(submissionRef, {
                status: 'graded',
                score: finalScore,
                responses: updatedResponses,
                feedback: feedback,
            });

            await batch.commit();

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
    
    const isLoading = isSubmissionLoading || isDependentDataLoading;

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
                    <div><Badge variant="outline">Submitted: {submission.submittedAt.toDate().toLocaleString()}</Badge></div>
                    <div><Badge variant="outline">Subject: {exam?.subject}</Badge></div>
                    <div><Badge variant="outline">Grade: {exam?.gradeLevel}</Badge></div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {questions?.map((q, index) => {
                    const studentAnswer = submission?.responses?.find(a => a.questionId === q.id);
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

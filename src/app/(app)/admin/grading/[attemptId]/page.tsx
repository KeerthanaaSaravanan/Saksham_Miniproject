
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { useDoc, useCollection, useMemoFirebase, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import type { WithId } from '@/firebase';
import { doc, collection, writeBatch } from 'firebase/firestore';

type Question = WithId<{
    question: string;
    marks: number;
}>;

type Answer = WithId<{
    questionId: string;
    answer: string;
}>;

type Submission = WithId<{
    userId: string;
    studentName: string;
    examId: string;
    endTime: { seconds: number; nanoseconds: number };
    status: 'Pending' | 'Graded';
    score: number;
}>;

type UserProfile = WithId<{
    displayName: string;
    photoURL: string;
    email: string;
}>;

type Exam = WithId<{
    title: string;
    subject: string;
    gradeLevel: string;
}>;


export default function GradingPage() {
    const params = useParams();
    const examId = params.examId as string;
    const submissionId = params.submissionId as string;
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    
    const [isSaving, setIsSaving] = useState(false);
    
    const submissionRef = useMemoFirebase(() => firestore && submissionId && doc(firestore, `exams/${examId}/submissions`, submissionId), [firestore, examId, submissionId]);
    const { data: submission, isLoading: isSubmissionLoading } = useDoc<Submission>(submissionRef);

    const examRef = useMemoFirebase(() => firestore && examId && doc(firestore, 'exams', examId), [firestore, examId]);
    const { data: exam, isLoading: isExamLoading } = useDoc<Exam>(examRef);

    const studentRef = useMemoFirebase(() => firestore && submission?.userId && doc(firestore, 'users', submission.userId), [firestore, submission]);
    const { data: student, isLoading: isStudentLoading } = useDoc<UserProfile>(studentRef);

    const questionsQuery = useMemoFirebase(() => firestore && examId && collection(firestore, `exams/${examId}/questions`), [firestore, examId]);
    const { data: questions, isLoading: areQuestionsLoading } = useCollection<Question>(questionsQuery);

    const answersQuery = useMemoFirebase(() => firestore && examId && submissionId && collection(firestore, `exams/${examId}/submissions/${submissionId}/answers`), [firestore, examId, submissionId]);
    const { data: answers, isLoading: areAnswersLoading } = useCollection<Answer>(answersQuery);

    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState<Record<string, string>>({});
    
    const isLoading = isSubmissionLoading || isExamLoading || isStudentLoading || areQuestionsLoading || areAnswersLoading;

    useEffect(() => {
        if (questions) {
            const initialScores: Record<string, number> = {};
            questions.forEach(q => {
                initialScores[q.id] = 0;
            });
            setScores(initialScores);
        }
    }, [questions]);


    const handleSaveGrade = async () => {
        if (!submissionRef || !firestore || !questions) return;
        setIsSaving(true);
        
        const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
        const obtainedMarks = Object.values(scores).reduce((sum, s) => sum + s, 0);
        const finalScore = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

        try {
            const batch = writeBatch(firestore);
            
            // Update the main submission document
            batch.update(submissionRef, {
                score: finalScore,
                status: 'Graded',
            });

            // Update individual answer documents with scores and feedback
            answers?.forEach(answer => {
                const answerRef = doc(firestore, `exams/${examId}/submissions/${submissionId}/answers`, answer.id);
                batch.update(answerRef, {
                    score: scores[answer.questionId] || 0,
                    feedback: feedback[answer.questionId] || ''
                });
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
                    <div><Badge variant="outline">Submitted: {new Date(submission.endTime.seconds * 1000).toLocaleString()}</Badge></div>
                    <div><Badge variant="outline">Subject: {exam?.subject}</Badge></div>
                    <div><Badge variant="outline">Grade: {exam?.gradeLevel}</Badge></div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {questions?.map((q, index) => {
                    const studentAnswer = answers?.find(a => a.questionId === q.id);
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
                            <CardFooter className="flex flex-col sm:flex-row items-start gap-4 bg-muted/50 p-4">
                                <div className="flex-1 w-full space-y-2">
                                    <Label htmlFor={`feedback-${q.id}`}>Feedback (Optional)</Label>
                                    <Textarea 
                                        id={`feedback-${q.id}`}
                                        placeholder="Provide constructive feedback..."
                                        value={feedback[q.id] || ''}
                                        onChange={(e) => setFeedback(prev => ({...prev, [q.id]: e.target.value}))}
                                    />
                                </div>
                                <div className="w-full sm:w-40 space-y-2">
                                     <Label htmlFor={`score-${q.id}`}>Score Awarded</Label>
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

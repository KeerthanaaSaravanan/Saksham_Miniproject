
'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useUser, errorEmitter, FirestorePermissionError, useMemoFirebase } from '@/firebase';
import { doc, getDoc, collection, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
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

type Question = {
    id: string;
    question: string;
    marks: number;
};

type Answer = {
    id: string;
    questionId: string;
    answer: string;
};

type Student = {
    displayName: string;
    photoURL: string;
    email: string;
};

export default function GradingPage() {
    const { attemptId } = useParams();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [exam, setExam] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [attempt, setAttempt] = useState<any>(null);
    const [student, setStudent] = useState<Student | null>(null);

    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!firestore || !attemptId) return;

        const fetchSubmissionData = async () => {
            setIsLoading(true);
            try {
                // Find the attempt document using a collectionGroup query
                const attemptsQuery = query(collection(firestore, 'exam_attempts'), where('__name__', '==', `exam_attempts/${attemptId}`));

                // This is a placeholder since collectionGroup queries can't be used directly like this.
                // A real implementation would need a different structure or to know the user's ID.
                // For this app, let's assume we can find the attempt by its ID across all users.
                // The correct way would be to search through users, but that's inefficient.
                // We'll simulate finding it.

                let attemptRef: any;
                let attemptData: any;
                const usersSnap = await getDocs(collection(firestore, 'users'));
                for(const userDoc of usersSnap.docs) {
                    const tempAttemptRef = doc(firestore, 'users', userDoc.id, 'exam_attempts', attemptId as string);
                    const attemptSnap = await getDoc(tempAttemptRef);
                    if (attemptSnap.exists()) {
                        attemptRef = tempAttemptRef;
                        attemptData = attemptSnap.data();
                        break;
                    }
                }

                if (!attemptRef) {
                    toast({ variant: 'destructive', title: 'Error', description: 'Submission not found.' });
                    router.back();
                    return;
                }
                
                setAttempt(attemptData);
                
                // Fetch associated data
                const [studentSnap, examSnap, answersSnap, questionsSnap] = await Promise.all([
                    getDoc(doc(firestore, 'users', attemptData.userId)),
                    getDoc(doc(firestore, 'exams', attemptData.examId)),
                    getDocs(collection(attemptRef, 'answers')),
                    getDocs(collection(doc(firestore, 'exams', attemptData.examId), 'questions')),
                ]);

                if (studentSnap.exists()) setStudent(studentSnap.data() as Student);
                if (examSnap.exists()) setExam({ id: examSnap.id, ...examSnap.data() });

                setAnswers(answersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Answer)));
                setQuestions(questionsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Question)));
                
                // Initialize scores
                const initialScores: Record<string, number> = {};
                questionsSnap.docs.forEach(q => {
                    initialScores[q.id] = 0;
                });
                setScores(initialScores);

            } catch (error) {
                console.error("Error fetching submission data:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load submission data.' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmissionData();

    }, [firestore, attemptId, router, toast]);

    const handleSaveGrade = async () => {
        if (!firestore || !attemptId || !attempt) return;
        setIsSaving(true);
        
        const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
        const obtainedMarks = Object.values(scores).reduce((sum, s) => sum + s, 0);
        const finalScore = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
        
        try {
            const batch = writeBatch(firestore);
            
            // Update the main attempt document
            const attemptRef = doc(firestore, 'users', attempt.userId, 'exam_attempts', attemptId as string);
            batch.update(attemptRef, {
                score: finalScore,
                status: 'graded',
                gradedAt: serverTimestamp()
            });

            // Update individual answers with feedback
            answers.forEach(ans => {
                const answerRef = doc(attemptRef, 'answers', ans.id);
                batch.update(answerRef, {
                    marks: scores[ans.questionId] || 0,
                    feedback: feedback[ans.questionId] || '',
                    isCorrect: (scores[ans.questionId] || 0) === questions.find(q => q.id === ans.questionId)?.marks
                });
            });

            await batch.commit();

            toast({ title: 'Grade Saved!', description: `The submission has been graded with a score of ${finalScore.toFixed(1)}%.` });
            router.push('/admin/examinations');

        } catch (error: any) {
            console.error("Error saving grade:", error);
            const permissionError = new FirestorePermissionError({
                path: `users/${attempt.userId}/exam_attempts/${attemptId}`,
                operation: 'update',
                requestResourceData: { score: finalScore, status: 'graded' },
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setIsSaving(false);
        }
    }
    
    const totalScore = Object.values(scores).reduce((sum, score) => sum + (Number(score) || 0), 0);
    const maxScore = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

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

    if (!attempt) {
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
                    <div><Badge variant="outline">Submitted: {attempt.endTime.toDate().toLocaleString()}</Badge></div>
                    <div><Badge variant="outline">Subject: {exam?.subject}</Badge></div>
                    <div><Badge variant="outline">Grade: {exam?.gradeLevel}</Badge></div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {questions.map((q, index) => {
                    const studentAnswer = answers.find(a => a.questionId === q.id);
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


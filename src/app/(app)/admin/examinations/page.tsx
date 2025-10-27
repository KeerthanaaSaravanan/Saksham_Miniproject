
'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, Timestamp, getDocs, doc, writeBatch } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Edit, Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

type Exam = {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
    startTime: Timestamp;
    endTime: Timestamp;
    durationMinutes?: number;
};

type Submission = {
    studentId: string;
    studentName: string;
    submittedAt: Date;
    status: 'Pending' | 'Graded';
    score: number;
}

const getExamStatus = (startTime: Timestamp, endTime: Timestamp): { text: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
    const now = new Date();
    const start = startTime.toDate();
    const end = endTime.toDate();

    if (now < start) {
        return { text: 'Upcoming', variant: 'secondary' };
    } else if (now > end) {
        return { text: 'Completed', variant: 'outline' };
    } else {
        return { text: 'Live', variant: 'destructive' };
    }
};

const ExamSubmissions = ({ examId }: { examId: string }) => {
    const firestore = useFirestore();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!firestore) return;
            setIsLoading(true);
            const attempts: Submission[] = [];
            const usersSnap = await getDocs(collection(firestore, 'users'));
            for (const userDoc of usersSnap.docs) {
                 const attemptsQuery = query(collection(firestore, 'users', userDoc.id, 'exam_attempts'), where => where('examId', '==', examId));
                 const attemptsSnap = await getDocs(attemptsQuery);
                 attemptsSnap.forEach(doc => {
                     const data = doc.data();
                     attempts.push({
                         studentId: userDoc.id,
                         studentName: userDoc.data().displayName || 'Anonymous',
                         submittedAt: data.endTime.toDate(),
                         status: data.status === 'graded' ? 'Graded' : 'Pending',
                         score: data.score
                     });
                 });
            }
            setSubmissions(attempts);
            setIsLoading(false);
        }
        fetchSubmissions();
    }, [firestore, examId]);
    
    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    if (submissions.length === 0) {
        return <p className="text-center text-muted-foreground p-8">No submissions for this exam yet.</p>
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.map(sub => (
                            <TableRow key={sub.studentId}>
                                <TableCell className="font-medium">{sub.studentName}</TableCell>
                                <TableCell>{sub.submittedAt.toLocaleString()}</TableCell>
                                <TableCell>{sub.score.toFixed(1)}%</TableCell>
                                <TableCell><Badge variant={sub.status === 'Graded' ? 'secondary' : 'default'}>{sub.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                   <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>View Answer Sheet</DropdownMenuItem>
                                            <DropdownMenuItem>Grade Submission</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


export default function ExaminationsPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [examToDelete, setExamToDelete] = useState<Exam | null>(null);

    const examsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'exams'));
    }, [firestore]);

    const { data: exams, isLoading: areExamsLoading } = useCollection<Exam>(examsQuery);
    
    const handleDeleteExam = async () => {
        if (!examToDelete || !firestore) return;

        const examRef = doc(firestore, 'exams', examToDelete.id);
        const questionsRef = collection(examRef, 'questions');

        try {
            const batch = writeBatch(firestore);
            
            // Delete all questions in the subcollection
            const questionsSnap = await getDocs(questionsRef);
            questionsSnap.forEach(questionDoc => {
                batch.delete(questionDoc.ref);
            });
            
            // Delete the main exam document
            batch.delete(examRef);
            
            await batch.commit();

            toast({
                title: "Exam Deleted",
                description: `"${examToDelete.title}" and all its questions have been removed.`,
            });
            
        } catch (error) {
            console.error("Error deleting exam:", error);
            toast({
                variant: "destructive",
                title: "Deletion Failed",
                description: "Could not delete the exam. Please try again.",
            });
        } finally {
            setExamToDelete(null);
        }
    };

    return (
        <>
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Examinations</h1>
                <p className="text-muted-foreground">
                    Manage upcoming, live, and completed exams.
                </p>
            </div>
            
            {areExamsLoading ? (
                 <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                 </div>
            ) : !exams || exams.length === 0 ? (
                 <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <h2 className="mt-6 text-xl font-semibold">No Exams Found</h2>
                    <p className="mt-2 text-muted-foreground">
                        You haven't uploaded any question papers yet.
                    </p>
                     <Button className="mt-4" onClick={() => router.push('/admin/upload')}>Create Exam</Button>
                </Card>
            ) : (
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {exams.map(exam => {
                        const status = getExamStatus(exam.startTime, exam.endTime);
                        return (
                            <AccordionItem key={exam.id} value={exam.id} className="border-b-0">
                                <Card className="overflow-hidden">
                                    <AccordionTrigger className="p-6 hover:no-underline [&[data-state=open]]:bg-muted/50">
                                        <div className="flex justify-between items-center w-full">
                                            <div className="text-left">
                                                <CardTitle className="text-lg">{exam.title}</CardTitle>
                                                <CardDescription className="mt-1 flex items-center gap-2">
                                                    <span>{exam.subject}</span>
                                                    <Badge variant="outline">{exam.gradeLevel}</Badge>
                                                    <span>Starts: {exam.startTime.toDate().toLocaleString()}</span>
                                                </CardDescription>
                                            </div>
                                            <Badge variant={status.variant} className="h-6">{status.text}</Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6">
                                        <div className="space-y-6 mt-4 pt-4 border-t">
                                            <div className="flex justify-between items-center">
                                                 <h3 className="text-lg font-semibold">Student Submissions</h3>
                                                 <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => router.push(`/admin/upload?examId=${exam.id}`)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Exam
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => setExamToDelete(exam)}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Exam
                                                    </Button>
                                                 </div>
                                            </div>
                                           <ExamSubmissions examId={exam.id} />
                                        </div>
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            )}
        </div>

        {examToDelete && (
            <AlertDialog open onOpenChange={() => setExamToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the exam
                             "{examToDelete.title}" and all associated student submissions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteExam}>
                            Yes, delete exam
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
        </>
    );
}

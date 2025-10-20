
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Users, FilePlus, Clock, BookOpen, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

type Student = {
    id: string;
    name: string;
    email: string;
    progress: number;
    disability: string;
    avatar: string;
};

type Exam = {
    id: string;
    title: string;
    subject: string;
    startTime: Timestamp;
};

type SubjectPerformance = {
    subject: string;
    score: number;
};

export default function AdminDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const [students, setStudents] = useState<Student[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
    const [stats, setStats] = useState({ totalStudents: 0, assessmentsCreated: 0, pendingReviews: 8, activeExams: 0 });
    const [isLoading, setIsLoading] = useState(true);
    
    const facultyName = user?.displayName || 'Faculty';

    useEffect(() => {
        if (!firestore) return;

        const fetchData = async () => {
            setIsLoading(true);
            
            // Fetch Students and their progress
            const usersQuery = query(collection(firestore, 'users'), where('role', '==', 'student'));
            const usersSnap = await getDocs(usersQuery);
            const studentList: Student[] = [];
            let totalAttemptsScore = 0;
            let totalAttemptsCount = 0;

            const subjectScores: { [key: string]: { total: number, count: number } } = {};

            for (const userDoc of usersSnap.docs) {
                const userData = userDoc.data();
                let studentProgress = 0;

                const attemptsQuery = collection(firestore, 'users', userDoc.id, 'exam_attempts');
                const attemptsSnap = await getDocs(attemptsQuery);
                
                if (!attemptsSnap.empty) {
                    let totalScore = 0;
                    attemptsSnap.forEach(attemptDoc => {
                        const attemptData = attemptDoc.data();
                        totalScore += attemptData.score;
                        
                        // For subject performance chart
                        const examId = attemptData.examId;
                        // This part is inefficient and should be denormalized in a real app
                        // but for now, we'll make a quick fetch to get subject
                    });
                    studentProgress = totalScore / attemptsSnap.size;
                }

                studentList.push({
                    id: userDoc.id,
                    name: userData.displayName || 'N/A',
                    email: userData.email,
                    progress: studentProgress,
                    disability: 'N/A', // This would need to be fetched from their accessibility profile
                    avatar: userData.photoURL || `https://picsum.photos/seed/${userDoc.id}/40/40`,
                });
            }
            setStudents(studentList);

            // Fetch Exams for deadlines and stats
            const examsQuery = query(collection(firestore, 'exams'));
            const examsSnap = await getDocs(examsQuery);
            const now = new Date();
            const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            
            const examList = examsSnap.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Exam))
                .filter(exam => exam.startTime.toDate() > now && exam.startTime.toDate() < oneWeekFromNow)
                .sort((a, b) => a.startTime.toDate().getTime() - b.startTime.toDate().getTime());
            
            setExams(examList);

            // Calculate subject performance
            // This is a very inefficient way, in a real app you would denormalize or use a function
            const allAttempts: { score: number; examId: string }[] = [];
            for (const userDoc of usersSnap.docs) {
                 const attemptsQuery = collection(firestore, 'users', userDoc.id, 'exam_attempts');
                 const attemptsSnap = await getDocs(attemptsQuery);
                 attemptsSnap.forEach(doc => allAttempts.push(doc.data() as any));
            }
            
            const examDetails: {[key: string]: {subject: string}} = {};
            for(const examDoc of examsSnap.docs) {
                examDetails[examDoc.id] = examDoc.data() as any;
            }

            allAttempts.forEach(attempt => {
                const subject = examDetails[attempt.examId]?.subject;
                if(subject) {
                    if(!subjectScores[subject]) subjectScores[subject] = { total: 0, count: 0 };
                    subjectScores[subject].total += attempt.score;
                    subjectScores[subject].count++;
                }
            });
            
            const performanceData = Object.entries(subjectScores).map(([subject, data]) => ({
                subject,
                score: data.total / data.count,
            }));
            setSubjectPerformance(performanceData);

            // Set Stats
            setStats(prev => ({
                ...prev,
                totalStudents: usersSnap.size,
                assessmentsCreated: examsSnap.size,
                activeExams: examsSnap.docs.filter(doc => {
                    const exam = doc.data() as Exam;
                    return exam.startTime.toDate() < now && exam.endTime.toDate() > now;
                }).length,
            }));
            
            setIsLoading(false);
        };

        fetchData().catch(console.error);

    }, [firestore]);
    
    const chartConfig = {
      score: {
        label: "Avg. Score",
        color: "hsl(var(--primary))",
      },
    } satisfies ChartConfig

  return (
    <div className="space-y-8">
      {isUserLoading ? (
        <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-96" />
        </div>
      ) : (
        <div>
            <h1 className="text-3xl font-bold font-headline">Welcome back, {facultyName}!</h1>
            <p className="text-muted-foreground">
                Here's a summary of your academic operations and student progress.
            </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 {isLoading ? <Skeleton className="h-7 w-20 mt-1" /> : <div className="text-2xl font-bold">{stats.totalStudents}</div>}
                <p className="text-xs text-muted-foreground">Managed across all grades</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assessments Created</CardTitle>
                <FilePlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 {isLoading ? <Skeleton className="h-7 w-20 mt-1" /> : <div className="text-2xl font-bold">{stats.assessmentsCreated}</div>}
                <p className="text-xs text-muted-foreground">Total exams uploaded</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground text-amber-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats.pendingReviews}</div>
                <p className="text-xs text-muted-foreground">Manual grading required</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground text-primary" />
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-7 w-20 mt-1" /> : <div className="text-2xl font-bold">{stats.activeExams}</div>}
                <p className="text-xs text-muted-foreground">Currently live for students</p>
            </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Average Performance by Subject</CardTitle>
                <CardDescription>An overview of student scores across different subjects.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                {isLoading ? <Skeleton className="h-[250px] w-full" /> : (
                    subjectPerformance.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <BarChart accessibilityLayer data={subjectPerformance}>
                                <XAxis dataKey="subject" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 8)} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Bar dataKey="score" fill="var(--color-score)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-muted-foreground">No performance data available yet.</div>
                    )
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                 <CardDescription>Exams and grading scheduled for this week.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : exams.length > 0 ? (
                    exams.slice(0, 3).map(exam => (
                        <div key={exam.id} className="flex items-center">
                            <div className="rounded-full bg-primary/10 p-3">
                                <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{exam.title}</p>
                                <p className="text-sm text-muted-foreground">{exam.startTime.toDate().toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No upcoming deadlines this week.</div>
                )}
            </CardContent>
        </Card>
       </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Progress Overview</CardTitle>
          <CardDescription>A summary of student performance and activity.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Accessibility Need</TableHead>
                    <TableHead className="w-48">Overall Progress</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={student.avatar} alt="Avatar" />
                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="grid gap-1">
                            <p className="text-sm font-medium leading-none text-foreground">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.disability === 'N/A' ? "secondary" : "outline"}>{student.disability}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            <Progress value={student.progress} className="w-full bg-muted h-2" />
                            <span className="text-xs text-muted-foreground font-medium">{student.progress.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Check Submissions</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

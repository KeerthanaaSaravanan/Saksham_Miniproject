
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
import { MoreHorizontal, Users, FilePlus, Clock, BookOpen, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import type { WithId } from '@/firebase';
import Link from 'next/link';

type Student = WithId<{
    name: string;
    email: string;
    progress: number;
    disability: string;
    avatar: string;
    gradeLevel: string;
    role: 'student';
}>;

type Exam = WithId<{
    title: string;
    subject: string;
    gradeLevel: string;
    startTime: { seconds: number; nanoseconds: number };
}>;

type SubjectPerformance = {
    subject: string;
    score: number;
};

const MOCK_PERFORMANCE: SubjectPerformance[] = [
    { subject: 'Math', score: 85 },
    { subject: 'Science', score: 78 },
    { subject: 'History', score: 92 },
    { subject: 'English', score: 81 },
    { subject: 'Physics', score: 72 },
];


export default function AdminDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const studentsQuery = useMemoFirebase(() => firestore && collection(firestore, 'users'), [firestore]);
    const { data: students, isLoading: areStudentsLoading } = useCollection<Student>(studentsQuery);
    
    const upcomingExamsQuery = useMemoFirebase(() => firestore && query(
        collection(firestore, 'exams'),
        where('startTime', '>', new Date()),
        orderBy('startTime', 'asc'),
        limit(4)
    ), [firestore]);
    const { data: exams, isLoading: areExamsLoading } = useCollection<Exam>(upcomingExamsQuery);
    
    const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
    const [stats, setStats] = useState({ totalStudents: 0, assessmentsCreated: 0, pendingReviews: 8, activeExams: 0 });
    const [isLoading, setIsLoading] = useState(true);
    
    const facultyName = user?.displayName || 'Faculty';
    
    useEffect(() => {
        const fetchData = async () => {
            if (areStudentsLoading || areExamsLoading) return;
            setIsLoading(true);
            
            setSubjectPerformance(MOCK_PERFORMANCE);
            setStats({
                totalStudents: students?.length || 0,
                assessmentsCreated: 0, // This would require another query
                pendingReviews: 8,
                activeExams: 0,
            });

            setIsLoading(false);
        };
        fetchData();
    }, [areStudentsLoading, areExamsLoading, students]);
    
    const chartConfig = {
      score: {
        label: "Avg. Score",
        color: "hsl(var(--primary))",
      },
    } satisfies ChartConfig

  return (
    <div className="space-y-6">
        <div>
            {isUserLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-5 w-96" />
                </div>
            ) : (
                <>
                    <h1 className="text-3xl font-bold font-headline">Welcome back, {facultyName}!</h1>
                    <p className="text-muted-foreground">
                        Here's a summary of your academic operations and student progress.
                    </p>
                </>
            )}
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card>
                <CardHeader>
                    <CardTitle>Average Performance by Subject</CardTitle>
                    <CardDescription>An overview of student scores across different subjects.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                        subjectPerformance.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <BarChart data={subjectPerformance}>
                                    <XAxis dataKey="subject" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 8)} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                    <Bar dataKey="score" fill="var(--color-score)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground">No performance data available yet.</div>
                        )
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Upcoming Deadlines</CardTitle>
                    <CardDescription>Exams starting within the next week.</CardDescription>
                </CardHeader>
                <CardContent>
                    {areExamsLoading ? <Skeleton className="h-[300px] w-full" /> : (
                         exams && exams.length > 0 ? (
                            <div className="space-y-4">
                            {exams.map(exam => (
                                <div key={exam.id} className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{exam.title}</p>
                                        <p className="text-xs text-muted-foreground">{exam.subject} - {exam.gradeLevel}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">{new Date(exam.startTime.seconds * 1000).toLocaleDateString()}</p>
                                </div>
                            ))}
                            </div>
                         ) : (
                             <div className="h-[300px] flex items-center justify-center text-muted-foreground">No upcoming exams.</div>
                         )
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
                {areStudentsLoading ? (
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                    </div>
                ) : (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Accessibility Need</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead className="w-48 text-right">Overall Progress</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {students && students.map((student) => (
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
                            <Badge variant={!student.disability || student.disability === 'N/A' ? "secondary" : "outline"}>{student.disability || 'N/A'}</Badge>
                        </TableCell>
                         <TableCell>
                            <Badge variant="outline">{student.gradeLevel}</Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-sm text-muted-foreground font-medium">{student.progress?.toFixed(0) || 0}%</span>
                                <Progress value={student.progress || 0} className="w-24 bg-muted h-2" />
                            </div>
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

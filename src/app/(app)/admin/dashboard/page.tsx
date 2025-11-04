
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
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';

type Student = {
    id: string;
    name: string;
    email: string;
    progress: number;
    disability: string;
    avatar: string;
    gradeLevel: string;
};

type Exam = {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
    startTime: Date;
    endTime: Date;
};

type SubjectPerformance = {
    subject: string;
    score: number;
};

const MOCK_STUDENTS: Student[] = [
    { id: '1', name: 'Alice Smith', email: 'alice@example.com', progress: 82, disability: 'Dyslexia', avatar: 'https://i.pravatar.cc/40?u=1', gradeLevel: 'Class 8' },
    { id: '2', name: 'Bob Johnson', email: 'bob@example.com', progress: 75, disability: 'N/A', avatar: 'https://i.pravatar.cc/40?u=2', gradeLevel: 'Class 8' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com', progress: 91, disability: 'Visual', avatar: 'https://i.pravatar.cc/40?u=3', gradeLevel: 'Class 9' },
    { id: '4', name: 'Diana Prince', email: 'diana@example.com', progress: 68, disability: 'N/A', avatar: 'https://i.pravatar.cc/40?u=4', gradeLevel: 'Class 9' },
];

const MOCK_EXAMS: Exam[] = [
    { id: '1', title: 'Annual History Exam', subject: 'History', gradeLevel: 'Class 8', startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)},
    { id: '2', title: 'Mid-Term Physics Exam', subject: 'Physics', gradeLevel: 'Class 9', startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)},
];

const MOCK_PERFORMANCE: SubjectPerformance[] = [
    { subject: 'Math', score: 85 },
    { subject: 'Science', score: 78 },
    { subject: 'History', score: 92 },
    { subject: 'English', score: 81 },
    { subject: 'Physics', score: 72 },
];


export default function AdminDashboardPage() {
    const { user, isUserLoading } = useUser();
    const [students, setStudents] = useState<Student[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
    const [stats, setStats] = useState({ totalStudents: 0, assessmentsCreated: 0, pendingReviews: 8, activeExams: 0 });
    const [isLoading, setIsLoading] = useState(true);
    
    const facultyName = user?.displayName || 'Faculty';
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            setStudents(MOCK_STUDENTS);
            setExams(MOCK_EXAMS);
            setSubjectPerformance(MOCK_PERFORMANCE);
            setStats({
                totalStudents: MOCK_STUDENTS.length,
                assessmentsCreated: MOCK_EXAMS.length,
                pendingReviews: 8,
                activeExams: 1,
            });

            setIsLoading(false);
        };
        fetchData();
    }, []);
    
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
                    {isLoading ? <Skeleton className="h-[300px] w-full" /> : (
                         exams.length > 0 ? (
                            <div className="space-y-4">
                            {exams.slice(0, 4).map(exam => (
                                <div key={exam.id} className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                        <BookOpen className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{exam.title}</p>
                                        <p className="text-xs text-muted-foreground">{exam.subject} - {exam.gradeLevel}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">{exam.startTime.toLocaleDateString()}</p>
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
                        <TableHead>Grade</TableHead>
                        <TableHead className="w-48 text-right">Overall Progress</TableHead>
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
                            <Badge variant="outline">{student.gradeLevel}</Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-sm text-muted-foreground font-medium">{student.progress.toFixed(0)}%</span>
                                <Progress value={student.progress} className="w-24 bg-muted h-2" />
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

    
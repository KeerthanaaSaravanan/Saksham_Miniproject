
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { TrendingUp, Users, CheckCircle, Award } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


type Exam = {
    id: string;
    title: string;
    subject: string;
    gradeLevel: string;
};

type ExamAttempt = {
    id: string;
    userId: string;
    examId: string;
    score: number;
    userName?: string; 
    userAvatar?: string; 
};

const PASS_THRESHOLD = 50; 

const MOCK_EXAMS: Exam[] = [
    { id: 'exam1', title: 'Mid-Term Social Studies', subject: 'Social Studies', gradeLevel: 'Class 8' },
    { id: 'exam2', title: 'Annual Physics Exam', subject: 'Physics', gradeLevel: 'Class 11' },
];

const MOCK_ATTEMPTS: ExamAttempt[] = [
    { id: 'attempt1', userId: 'user1', examId: 'exam1', score: 85, userName: 'Alice', userAvatar: 'https://i.pravatar.cc/40?u=user1' },
    { id: 'attempt2', userId: 'user2', examId: 'exam1', score: 45, userName: 'Bob', userAvatar: 'https://i.pravatar.cc/40?u=user2' },
    { id: 'attempt3', userId: 'user3', examId: 'exam1', score: 92, userName: 'Charlie', userAvatar: 'https://i.pravatar.cc/40?u=user3' },
    { id: 'attempt4', userId: 'user4', examId: 'exam2', score: 78, userName: 'David', userAvatar: 'https://i.pravatar.cc/40?u=user4' },
    { id: 'attempt5', userId: 'user5', examId: 'exam2', score: 65, userName: 'Eve', userAvatar: 'https://i.pravatar.cc/40?u=user5' },
];

export default function AnalyticsPage() {
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [exams, setExams] = useState<Exam[]>([]);
    const [areExamsLoading, setAreExamsLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching exams
        setExams(MOCK_EXAMS);
        setAreExamsLoading(false);
    }, []);

    useEffect(() => {
        if (exams && exams.length > 0 && !selectedExamId) {
            setSelectedExamId(exams[0].id);
        }
    }, [exams, selectedExamId]);
    
    useEffect(() => {
        const calculateAnalytics = async () => {
            if (!selectedExamId) return;

            setIsLoading(true);
            setAnalytics(null);

            // Simulate a delay for fetching data
            await new Promise(resolve => setTimeout(resolve, 500));

            const attempts = MOCK_ATTEMPTS.filter(a => a.examId === selectedExamId);
            
            if (attempts.length === 0) {
                setAnalytics({ attempts: [], avgScore: 0, highestScore: 0, lowestScore: 0, passCount: 0, failCount: 0, scoreDistribution: [] });
                setIsLoading(false);
                return;
            }

            const scores = attempts.map(a => a.score);
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            const highestScore = Math.max(...scores);
            const lowestScore = Math.min(...scores);
            
            const passCount = scores.filter(s => s >= PASS_THRESHOLD).length;
            const failCount = scores.length - passCount;

            const scoreDistribution = [
                { range: "0-20", count: scores.filter(s => s >= 0 && s <= 20).length },
                { range: "21-40", count: scores.filter(s => s > 20 && s <= 40).length },
                { range: "41-60", count: scores.filter(s => s > 40 && s <= 60).length },
                { range: "61-80", count: scores.filter(s => s > 60 && s <= 80).length },
                { range: "81-100", count: scores.filter(s => s > 80 && s <= 100).length },
            ];
            
            attempts.sort((a, b) => b.score - a.score);

            setAnalytics({
                attempts,
                avgScore,
                highestScore,
                lowestScore,
                passCount,
                failCount,
                scoreDistribution
            });

            setIsLoading(false);
        };

        calculateAnalytics();

    }, [selectedExamId]);

    const passFailData = useMemo(() => {
        if (!analytics) return [];
        const passColor = 'hsl(var(--primary))';
        const failColor = 'hsl(var(--destructive))';
        return [
            { name: 'Pass', value: analytics.passCount, fill: passColor },
            { name: 'Fail', value: analytics.failCount, fill: failColor }
        ];
    }, [analytics]);

    const distributionConfig = {
        count: {
            label: "Students",
            color: "hsl(var(--accent))",
        }
    } satisfies ChartConfig

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Exam Analytics</h1>
                    <p className="text-muted-foreground">
                        Insights into student performance and examination data.
                    </p>
                </div>
                <div className="w-full max-w-sm">
                   {areExamsLoading ? (
                        <Skeleton className="h-10 w-full" />
                   ) : (
                     <Select value={selectedExamId || ''} onValueChange={setSelectedExamId}>
                        <SelectTrigger id="exam-selector">
                            <SelectValue placeholder="Select an exam..." />
                        </SelectTrigger>
                        <SelectContent>
                            {exams?.map(exam => (
                                <SelectItem key={exam.id} value={exam.id}>{exam.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                   )}
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <Skeleton className="h-64 lg:col-span-2" />
                        <Skeleton className="h-64 lg:col-span-3" />
                    </div>
                     <Skeleton className="h-96 w-full" />
                </div>
            ) : !analytics || analytics.attempts.length === 0 ? (
                 <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <h2 className="mt-6 text-xl font-semibold">No Data Available</h2>
                    <p className="mt-2 text-muted-foreground">
                        No student submissions found for the selected exam.
                    </p>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics.avgScore.toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground">Across {analytics.attempts.length} submissions</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                                <Award className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics.highestScore.toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground">Top performance</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-destructive">{analytics.lowestScore.toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground">Needs improvement</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics.attempts.length}</div>
                                <p className="text-xs text-muted-foreground">Students submitted</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Pass / Fail Ratio</CardTitle>
                                <CardDescription>Percentage of students passing vs. failing.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                        <Pie data={passFailData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} strokeWidth={5}>
                                            {passFailData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                         <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle>Score Distribution</CardTitle>
                                <CardDescription>How student scores are distributed.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <ChartContainer config={distributionConfig} className="h-[250px] w-full">
                                    <BarChart accessibilityLayer data={analytics.scoreDistribution}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis dataKey="range" tickLine={false} axisLine={false} tickMargin={8} />
                                        <YAxis />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Leaderboard</CardTitle>
                            <CardDescription>Top performers for the selected exam.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">Rank</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead className="text-right">Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analytics.attempts.slice(0, 10).map((attempt: ExamAttempt, index: number) => (
                                         <TableRow key={attempt.id}>
                                            <TableCell className="font-bold text-lg text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={attempt.userAvatar} alt="Avatar" />
                                                        <AvatarFallback>{attempt.userName?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{attempt.userName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-lg">{attempt.score.toFixed(1)}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
      );
}

    

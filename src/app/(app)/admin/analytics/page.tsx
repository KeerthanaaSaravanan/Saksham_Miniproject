'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { TrendingUp, Percent, CheckCircle, Award } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';


const performanceData = [
  { month: 'Jan', "Avg Score": 65 },
  { month: 'Feb', "Avg Score": 68 },
  { month: 'Mar', "Avg Score": 72 },
  { month: 'Apr', "Avg Score": 78 },
  { month: 'May', "Avg Score": 82 },
  { month: 'Jun', "Avg Score": 85 },
];

const performanceConfig = {
  "Avg Score": {
    label: "Avg. Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const scoreDistributionData = [
    { range: "0-20", count: 5 },
    { range: "21-40", count: 12 },
    { range: "41-60", count: 28 },
    { range: "61-80", count: 45 },
    { range: "81-100", count: 32 },
]

const distributionConfig = {
    count: {
        label: "Students",
        color: "hsl(var(--accent))",
    }
} satisfies ChartConfig

const subjectPerformance = [
    { subject: "Algebra", avgScore: 88, passRate: 95, topScorer: "Kenji Tanaka" },
    { subject: "Physics", avgScore: 76, passRate: 82, topScorer: "Maria Garcia" },
    { subject: "History", avgScore: 81, passRate: 91, topScorer: "Alex Johnson" },
    { subject: "English", avgScore: 84, passRate: 98, topScorer: "Fatima Ahmed" },
    { subject: "Chemistry", avgScore: 79, passRate: 85, topScorer: "Sam Chen" },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Exam Analytics</h1>
            <p className="text-muted-foreground">
                Insights into student performance and examination data.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">81.5%</div>
                    <p className="text-xs text-muted-foreground">+3.2% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overall Pass Rate</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">92.1%</div>
                    <p className="text-xs text-muted-foreground">+1.5% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1,204</div>
                    <p className="text-xs text-muted-foreground">Across 12 exams this semester</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance Trend</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">Upward</div>
                    <p className="text-xs text-muted-foreground">Consistent improvement over 6 months</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Performance Over Time</CardTitle>
                    <CardDescription>Average student scores over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={performanceConfig} className="h-[250px] w-full">
                         <LineChart accessibilityLayer data={performanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Line dataKey="Avg Score" type="monotone" stroke="var(--color-Avg Score)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Score Distribution</CardTitle>
                    <CardDescription>Distribution of student scores in the last major exam.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={distributionConfig} className="h-[250px] w-full">
                        <BarChart accessibilityLayer data={scoreDistributionData}>
                            <XAxis
                                dataKey="range"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis hide />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Subject-wise Performance</CardTitle>
                <CardDescription>A breakdown of performance metrics for each subject.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Subject</TableHead>
                            <TableHead>Average Score</TableHead>
                            <TableHead>Pass Rate</TableHead>
                            <TableHead>Top Scorer</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subjectPerformance.map(sub => (
                             <TableRow key={sub.subject}>
                                <TableCell className="font-medium">{sub.subject}</TableCell>
                                <TableCell>
                                     <div className="flex items-center gap-2">
                                        <Progress value={sub.avgScore} className="w-24 bg-muted h-2" />
                                        <span className="text-xs text-muted-foreground">{sub.avgScore}%</span>
                                    </div>
                                </TableCell>
                                <TableCell>{sub.passRate}%</TableCell>
                                <TableCell>{sub.topScorer}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={sub.avgScore > 80 ? 'default' : 'secondary'}>
                                        {sub.avgScore > 80 ? 'Excellent' : 'Good'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}

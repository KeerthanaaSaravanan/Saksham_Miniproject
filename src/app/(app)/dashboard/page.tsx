
'use client';

import {
  BookOpen,
  Settings,
  LogOut,
  User,
  GraduationCap,
  Brain,
  ChevronRight,
  ClipboardList,
  Target,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useMemo } from 'react';
import { getSubjectsForGrade, SubjectCategory } from '@/lib/subjects';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { PracticeHistoryEntry } from '@/components/PracticeResults';

interface Exam {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  startTime: Date;
}

interface ExamAttempt {
    id: string;
    examId: string;
    score: number;
    endTime: Date;
    title?: string;
    subject?: string;
}

interface AccessibilityProfile {
  visual?: boolean;
  hearing?: boolean;
  motor?: boolean;
  sld?: boolean;
  cognitive?: boolean;
}

type PerformanceDataItem = {
  name: string;
  score: number;
  subject: string;
};

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const quotes = [
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
];

// MOCK DATA
const MOCK_USER_PROFILE = {
    gradeLevel: 'Class 8',
    stream: '',
    accessibility: { visual: true }
};

const MOCK_EXAMS: Exam[] = [
    { id: 'ex1', title: 'History Chapter 5 Test', subject: 'Social Science', gradeLevel: 'Class 8', startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { id: 'ex2', title: 'Algebra Mid-Term', subject: 'Mathematics', gradeLevel: 'Class 8', startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) }
];

const MOCK_PERFORMANCE: PerformanceDataItem[] = [
    { name: 'Practice: Geometry', score: 88, subject: 'Mathematics' },
    { name: 'Practice: The Cell', score: 75, subject: 'Science' },
    { name: 'History Exam', score: 92, subject: 'Social Science' },
];

const getPersonalizedGreeting = (name: string, profile?: AccessibilityProfile): string => {
    if (!profile) {
        return `Here's what's on your schedule. Let's get started.`;
    }
    if (profile.visual) {
        return "We’ve fine-tuned your view and added enhanced voice guidance for a smoother experience.";
    }
    if (profile.sld) {
        return "We’ve made your screen simpler and your reading experience smoother for better focus.";
    }
    return `Here's what's on your schedule. Let's get started.`;
};


export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [gradeLevel, setGradeLevel] = useState('');
  const [stream, setStream] = useState('');
  const [subjects, setSubjects] = useState<SubjectCategory[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [accessibilityProfile, setAccessibilityProfile] = useState<AccessibilityProfile | undefined>(undefined);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [performanceData, setPerformanceData] = useState<PerformanceDataItem[]>([]);
  const [isPerformanceLoading, setIsPerformanceLoading] = useState(true);
  const [quote, setQuote] = useState<{ quote: string; author: string } | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [areExamsLoading, setAreExamsLoading] = useState(true);

   useEffect(() => {
    // This will only run on the client, after initial hydration
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);
  
  useEffect(() => {
    if (user) {
      setIsProfileLoading(true);
      // Simulate fetching profile data
      setTimeout(() => {
        const userGrade = MOCK_USER_PROFILE.gradeLevel;
        const userStream = MOCK_USER_PROFILE.stream;
        setGradeLevel(userGrade);
        setStream(userStream);
        setSubjects(getSubjectsForGrade(userGrade, userStream));
        setAccessibilityProfile(MOCK_USER_PROFILE.accessibility);
        setWelcomeMessage(getPersonalizedGreeting(user.displayName || 'Student', MOCK_USER_PROFILE.accessibility));
        setIsProfileLoading(false);
      }, 500);
    } else if (!isUserLoading) {
        setIsProfileLoading(false);
        setWelcomeMessage(getPersonalizedGreeting('Student'));
    }
  }, [user, isUserLoading]);
  
  useEffect(() => {
    setIsPerformanceLoading(true);
    setAreExamsLoading(true);

    // Simulate fetching performance data & exams
    setTimeout(() => {
        setPerformanceData(MOCK_PERFORMANCE);
        setIsPerformanceLoading(false);

        setExams(MOCK_EXAMS);
        setAreExamsLoading(false);
    }, 1000);
  }, []);

  const getSubjectImage = (subjectId: string) => {
    const placeholder = PlaceHolderImages.find(img => img.id === subjectId.toLowerCase().replace(/ /g, '-'));
    return placeholder?.imageUrl || `https://picsum.photos/seed/${subjectId}/600/400`;
  };

  const userName = user?.displayName || 'Student';
  
  const { avgScore, scoreTrend, improvementAreas, recentChartData } = useMemo(() => {
    if (performanceData.length === 0) {
        return { avgScore: 0, scoreTrend: 0, improvementAreas: [], recentChartData: [] };
    }

    const totalScore = performanceData.reduce((sum, item) => sum + item.score, 0);
    const avgScore = totalScore / performanceData.length;
    
    const midpoint = Math.ceil(performanceData.length / 2);
    const firstHalf = performanceData.slice(0, midpoint);
    const secondHalf = performanceData.slice(midpoint);
    const avgFirstHalf = firstHalf.reduce((sum, item) => sum + item.score, 0) / (firstHalf.length || 1);
    const avgSecondHalf = secondHalf.reduce((sum, item) => sum + item.score, 0) / (secondHalf.length || 1);
    const scoreTrend = avgSecondHalf - avgFirstHalf;

    const subjectScores: { [key: string]: { total: number; count: number } } = {};
    performanceData.forEach(item => {
        if (!subjectScores[item.subject]) {
            subjectScores[item.subject] = { total: 0, count: 0 };
        }
        subjectScores[item.subject].total += item.score;
        subjectScores[item.subject].count++;
    });

    const improvementAreas = Object.entries(subjectScores)
        .map(([subject, data]) => ({ subject, avg: data.total / data.count }))
        .sort((a, b) => a.avg - b.avg)
        .slice(0, 3)
        .map(item => item.subject);

    const recentChartData = performanceData.slice(-6);

    return { avgScore, scoreTrend, improvementAreas, recentChartData };
  }, [performanceData]);
  
  const isLoading = isUserLoading || isProfileLoading || isPerformanceLoading;


  return (
    <div className="space-y-8 text-foreground">
      <main>
        <div className="bg-gradient-to-br from-primary to-accent p-8 rounded-xl relative overflow-hidden text-primary-foreground shadow-lg shadow-primary/20">
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full opacity-50 blur-3xl"></div>
           <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full opacity-50 blur-3xl"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
                <div className="flex items-center gap-4">
                {isLoading ? (
                    <Skeleton className="h-16 w-64 rounded-md bg-white/20" />
                ) : (
                    <>
                    <div className="text-5xl">👋</div>
                    <div>
                        <h2 className="text-4xl font-bold font-headline">Welcome, {userName}!</h2>
                        <p className="opacity-80 max-w-lg mt-1">
                            {welcomeMessage}
                        </p>
                    </div>
                    </>
                )}
                </div>
                { !isUserLoading && !isProfileLoading && gradeLevel &&
                    <div className="mt-6 flex gap-2">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            {gradeLevel}
                        </Badge>
                        {stream && (
                            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                            {stream}
                            </Badge>
                        )}
                    </div>
                }
            </div>
            {quote && (
            <div className="hidden md:block max-w-xs text-right opacity-80 z-10">
                <p className="text-sm font-medium italic">"{quote.quote}"</p>
                <p className="text-xs mt-1">- {quote.author}</p>
            </div>
          )}
          </div>
        </div>

        <section className="mt-8">
          <h3 className="text-2xl font-bold mb-4 text-foreground font-headline">My Subjects</h3>
          {isProfileLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
             </div>
          ) : subjects.length > 0 ? (
            <div className="space-y-6">
              {subjects.map((category) => (
                <div key={category.category}>
                    <h4 className="text-lg font-semibold mb-3 text-muted-foreground">{category.category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {category.subjects.map((subject) => (
                            <Card key={subject.id} className="bg-card border flex flex-col hover:border-primary transition-all duration-300 group hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                            <CardHeader className="relative h-32 p-0 overflow-hidden rounded-t-lg">
                                <Image src={getSubjectImage(subject.id)} alt={subject.name} fill style={{ objectFit: 'cover' }} data-ai-hint={`${subject.id} abstract`} className="group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <CardTitle className="absolute bottom-4 left-4 text-xl text-primary-foreground font-headline">{subject.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 flex-1">
                                <h4 className="text-sm font-semibold mb-2">Upcoming Exams</h4>
                                {areExamsLoading ? <Skeleton className="h-10 w-full" /> : (
                                    <div className="space-y-2">
                                    {exams && exams.filter(exam => exam.subject.toLowerCase() === subject.name.toLowerCase()).length > 0 ? (
                                        exams.filter(exam => exam.subject.toLowerCase() === subject.name.toLowerCase()).map(exam => (
                                        <div key={exam.id} className="text-xs p-2 rounded-md bg-muted/50 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-foreground">{exam.title}</p>
                                                <p className="text-muted-foreground">
                                                    {exam.startTime.toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => router.push('/assessment')}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted-foreground">No new exams scheduled.</p>
                                    )}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                    <Button variant="outline" className="w-full" onClick={() => router.push(`/practice?subject=${encodeURIComponent(subject.name)}`)}>
                                        <Target className="mr-2 h-4 w-4" />
                                        Take a Practice Test
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                <GraduationCap className="h-16 w-16 text-muted-foreground/50" />
                <h2 className="mt-6 text-xl font-semibold">Complete Your Profile</h2>
                <p className="mt-2 text-muted-foreground">
                   Go to settings to select your grade and subjects to see your dashboard.
                </p>
                <Button className="mt-4" onClick={() => router.push('/settings/profile')}>Go to Settings</Button>
            </Card>
          )}
        </section>

        <section className="mt-8">
          <h3 className="text-2xl font-bold text-foreground mb-4 font-headline">Progress &amp; Improvement</h3>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-card border">
                    <CardHeader>
                        <CardTitle>Recent Performance</CardTitle>
                        <CardDescription>Your scores from the last {recentChartData.length} assessments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-[250px] w-full" />
                        ) : recentChartData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <BarChart accessibilityLayer data={recentChartData}>
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) => value.slice(0, 10) + '...'}
                                    />
                                    <YAxis domain={[0, 100]} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="score" fill="var(--color-score)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                         ) : (
                            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                No performance data yet. Take a test!
                            </div>
                         )}
                    </CardContent>
                </Card>
                 <div className="space-y-6">
                    <Card className="bg-card border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? <Skeleton className="h-8 w-24" /> : (
                                <>
                                    <div className="text-2xl font-bold">{avgScore.toFixed(0)}%</div>
                                    <p className={`text-xs ${scoreTrend >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                                        {scoreTrend >= 0 ? '+' : ''}{scoreTrend.toFixed(1)}% from last period
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="bg-card border">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Improvement Areas</CardTitle>
                            <Brain className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          {isLoading ? <div className="space-y-2 mt-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div> : (
                             <div className="flex flex-col space-y-1 mt-2">
                                {improvementAreas.length > 0 ? (
                                    improvementAreas.map(subj => <p key={subj} className="text-sm font-medium">∙ {subj}</p>)
                                ) : (
                                    <p className="text-sm text-muted-foreground">No specific areas identified yet.</p>
                                )}
                             </div>
                          )}
                        </CardContent>
                    </Card>
                 </div>
           </div>
        </section>
      </main>
    </div>
  );
}

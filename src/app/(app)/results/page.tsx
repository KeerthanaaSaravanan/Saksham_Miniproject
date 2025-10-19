
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Check, X, ClipboardList, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

type ResultItem = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

type PracticeHistoryEntry = {
  id: string;
  title: string;
  subject: string;
  date: string;
  score: number;
  results: ResultItem[];
};

export default function ResultsPage() {
  const [history, setHistory] = useState<PracticeHistoryEntry[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedHistory = localStorage.getItem('practiceHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Could not load practice history from localStorage", error);
    }
  }, []);

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Practice History</h1>
          <p className="text-muted-foreground">
            Review your past practice exams and track your progress.
          </p>
        </div>
      </div>

      {history.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {history.map((entry) => (
            <AccordionItem key={entry.id} value={entry.id} className="border-b-0">
                <Card>
                    <AccordionTrigger className="p-6 hover:no-underline">
                        <div className="flex justify-between items-center w-full">
                            <div className="text-left">
                                <CardTitle className="text-lg">{entry.title}</CardTitle>
                                <CardDescription className="mt-1">
                                    {entry.subject} &bull; Taken on {new Date(entry.date).toLocaleDateString()}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-2xl font-bold" style={{ color: `hsl(var(--${entry.score >= 75 ? 'primary' : entry.score >= 50 ? 'accent' : 'destructive'}))` }}>
                                        {entry.score.toFixed(0)}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">Score</p>
                                </div>
                                <Progress value={entry.score} className="w-24 h-2" />
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                         <div className="space-y-6 mt-4 pt-4 border-t">
                            {entry.results.map((result, index) => (
                                <div key={index} className="p-4 rounded-lg border bg-muted/30">
                                    <p className="font-semibold">{index + 1}. {result.question}</p>
                                    <div className={`mt-2 flex items-start gap-3 p-3 rounded-md ${result.isCorrect ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                                        {result.isCorrect ? <Check className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" /> : <X className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />}
                                        <div className="flex-1">
                                            <p className="text-sm">Your answer: <span className="font-medium">{result.userAnswer || "No answer provided"}</span></p>
                                            {!result.isCorrect && <p className="text-sm">Correct answer: <span className="font-medium text-green-700 dark:text-green-500">{result.correctAnswer}</span></p>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </Card>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <ClipboardList className="h-16 w-16 text-muted-foreground/50" />
          <h2 className="mt-6 text-xl font-semibold">No Practice History Found</h2>
          <p className="mt-2 text-muted-foreground">
            Take a practice exam to start tracking your results.
          </p>
        </Card>
      )}
    </div>
  );
}

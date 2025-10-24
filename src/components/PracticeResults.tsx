
'use client';

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
import { Check, X, ClipboardList, Volume2, Repeat, BrainCircuit } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAccessibilityPanel } from './accessibility/accessibility-panel-provider';
import { Button } from './ui/button';
import { getTTS } from '@/lib/actions/chatbot';
import { useCallback, useRef, useState } from 'react';

type ResultItem = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
};

export type PracticeHistoryEntry = {
  id: string;
  title: string;
  subject: string;
  date: string;
  score: number;
  results: ResultItem[];
};

interface PracticeResultsProps {
    history: PracticeHistoryEntry[];
    isClient: boolean;
}

export function PracticeResults({ history, isClient }: PracticeResultsProps) {
  const { userProfile } = useAccessibilityPanel();
  const accessibility = userProfile?.accessibility_profile || {};
  const isTextToSpeechEnabled = accessibility.textToSpeech || accessibility.readAloud;
  const [isTTSSpeaking, setIsTTSSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTTS = useCallback(async (text: string) => {
    if (isTTSSpeaking || !isTextToSpeechEnabled) return;
    if (!audioRef.current) {
        audioRef.current = new Audio();
    }
    setIsTTSSpeaking(true);
    try {
        const result = await getTTS(text);
        if ('media' in result && audioRef.current) {
            audioRef.current.src = result.media;
            audioRef.current.play();
            audioRef.current.onended = () => setIsTTSSpeaking(false);
        } else {
            setIsTTSSpeaking(false);
        }
    } catch (error) {
        console.error("TTS Error:", error);
        setIsTTSSpeaking(false);
    }
  }, [isTTSSpeaking, isTextToSpeechEnabled]);


  const readEntryAloud = (entry: PracticeHistoryEntry) => {
    const summary = `Results for ${entry.title}, taken on ${new Date(entry.date).toLocaleDateString()}. Your score was ${entry.score.toFixed(0)} percent.`;
    const details = entry.results.map((result, index) => {
        const correctness = result.isCorrect ? 'Correct' : 'Incorrect';
        const answerDetail = result.isCorrect 
            ? `Your answer was ${result.userAnswer}. The explanation is: ${result.explanation}`
            : `Your answer was ${result.userAnswer}. The correct answer was ${result.correctAnswer}. The explanation is: ${result.explanation}`;
        return `Question ${index + 1}: ${result.question}. ${correctness}. ${answerDetail}`;
    }).join(' ');
    playTTS(`${summary} ${details}`);
  }

  if (!isClient) {
    return (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <ClipboardList className="h-16 w-16 text-muted-foreground/50 animate-pulse" />
          <h2 className="mt-6 text-xl font-semibold">Loading Practice History...</h2>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold font-headline">Practice History</h2>
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
                                {isTextToSpeechEnabled && (
                                  <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); readEntryAloud(entry); }} disabled={isTTSSpeaking} aria-label="Read results aloud">
                                      <Volume2 className={isTTSSpeaking ? "animate-pulse" : ""} />
                                  </Button>
                                )}
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
                                    <div className="mt-3 flex items-start gap-3 p-3 rounded-md bg-sky-500/10 border border-sky-500/20">
                                        <BrainCircuit className="h-5 w-5 text-sky-600 mt-1 flex-shrink-0 dark:text-sky-400"/>
                                        <div className="flex-1">
                                             <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">Explanation</p>
                                             <p className="text-sm text-muted-foreground">{result.explanation}</p>
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
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}

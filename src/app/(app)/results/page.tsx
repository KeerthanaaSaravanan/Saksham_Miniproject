'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';

export default function ResultsPage() {

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Official Exam Results</h1>
          <p className="text-muted-foreground">
            Review your results from faculty-graded exams.
          </p>
        </div>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
        <ClipboardCheck className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-6 text-xl font-semibold">No Official Results Found</h2>
        <p className="mt-2 text-muted-foreground">
          Results from your main exams will appear here once they are graded by the faculty.
        </p>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

const gradeConfig = {
  'Class 6': { subjects: true },
  'Class 7': { subjects: true },
  'Class 8': { subjects: true },
  'Class 9': { subjects: true },
  'Class 10': { subjects: true },
  'Class 11': { streams: ['Bio Math', 'Computer Science', 'Commerce'] },
  'Class 12': { streams: ['Bio Math', 'Computer Science', 'Commerce'] },
  College: { streams: ['Engineering', 'Arts and Science', 'Medical', 'Law', 'Architecture'] },
  'Competitive Exam': { streams: ['UPSC', 'TNPSC', 'GATE', 'CSAT'] },
};

const subjects = ['Science', 'Math', 'Social Science', 'English', 'Tamil'];

export default function StudentDetailsForm({ onComplete }: { onComplete: (details: any) => void }) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [stream, setStream] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedGradeConfig = gradeConfig[grade as keyof typeof gradeConfig];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // In a real app, you would save this to the user's profile in Firestore
    onComplete({ name, grade, stream: stream || (selectedGradeConfig?.subjects ? 'General' : '') });
    
    setIsLoading(false);
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl border p-8 space-y-6 animate-fade-in w-full max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Tell us about yourself
        </h1>
        <p className="text-sm text-muted-foreground">
          This helps us personalize your learning journey.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
                id="name"
                placeholder="Enter your full name"
                className="h-12"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">Grade / Level</Label>
          <Select value={grade} onValueChange={(value) => { setGrade(value); setStream(''); }}>
            <SelectTrigger id="grade" className="h-12">
              <SelectValue placeholder="Select your grade or level" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(gradeConfig).map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {grade && selectedGradeConfig?.subjects && (
             <div className="space-y-2 animate-fade-in">
                <Label>Subjects</Label>
                <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                        You will have access to exams for the following subjects: {subjects.join(', ')}.
                    </p>
                </div>
            </div>
        )}

        {grade && selectedGradeConfig?.streams && (
          <div className="space-y-2 animate-fade-in">
            <Label htmlFor="stream">Stream / Exam</Label>
            <Select value={stream} onValueChange={setStream} required>
              <SelectTrigger id="stream" className="h-12">
                <SelectValue placeholder="Select your stream or exam" />
              </SelectTrigger>
              <SelectContent>
                {selectedGradeConfig.streams.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
          disabled={isLoading || !name || !grade || (selectedGradeConfig?.streams && !stream)}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Complete Profile
        </Button>
      </form>
    </div>
  );
}

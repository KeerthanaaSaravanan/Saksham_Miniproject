
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
import { getSubjectsForGrade } from '@/lib/subjects';

const gradeConfig = {
  'Class 6': { subjects: true },
  'Class 7': { subjects: true },
  'Class 8': { subjects: true },
  'Class 9': { subjects: true },
  'Class 10': { subjects: true },
  'Class 11': { streams: ['Bio-Maths', 'Computer Science', 'Commerce'] },
  'Class 12': { streams: ['Bio-Maths', 'Computer Science', 'Commerce'] },
  College: { streams: ['Engineering', 'Arts and Science', 'Medical', 'Law', 'Architecture'] },
  'Competitive Exam': { streams: ['UPSC', 'TNPSC', 'GATE', 'CSAT'] },
};


export default function StudentDetailsForm({ onComplete, isLoading }: { onComplete: (details: any) => void, isLoading: boolean }) {
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [stream, setStream] = useState('');

  const selectedGradeConfig = gradeConfig[gradeLevel as keyof typeof gradeConfig];
  const subjectsForGrade = getSubjectsForGrade(gradeLevel, stream);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ name, gradeLevel, stream });
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
          <Label htmlFor="gradeLevel">Grade / Level</Label>
          <Select value={gradeLevel} onValueChange={(value) => { setGradeLevel(value); setStream(''); }}>
            <SelectTrigger id="gradeLevel" className="h-12">
              <SelectValue placeholder="Select your grade or level" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(gradeConfig).map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {gradeLevel && selectedGradeConfig?.subjects && (
             <div className="space-y-2 animate-fade-in">
                <Label>Subjects</Label>
                <div className="p-4 border rounded-lg bg-muted/50 max-h-40 overflow-y-auto">
                    {subjectsForGrade.map(category => (
                        <div key={category.category} className="mb-2">
                            <p className="text-sm font-semibold text-foreground">{category.category}</p>
                            <p className="text-sm text-muted-foreground">
                                {category.subjects.map(s => s.name).join(', ')}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {gradeLevel && selectedGradeConfig?.streams && (
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
          disabled={isLoading || !name || !gradeLevel || (selectedGradeConfig?.streams && !stream)}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Complete Profile
        </Button>
      </form>
    </div>
  );
}

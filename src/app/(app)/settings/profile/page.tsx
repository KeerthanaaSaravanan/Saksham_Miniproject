
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, GraduationCap, Save, Loader2, Image as ImageIcon, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { avatars } from '@/lib/avatars';
import { AvatarSelector } from '@/components/AvatarSelector';
import { Checkbox } from '@/components/ui/checkbox';
import { usePathname } from 'next/navigation';
import { gradeSubjectMap } from '@/lib/subjects';

const gradeConfig = {
  'Class 6': { subjects: true },
  'Class 7': { subjects: true },
  'Class 8': { subjects: true },
  'Class 9': { subjects: true },
  'Class 10': { subjects: true },
  'Class 11': { streams: ['Bio-Maths', 'Computer Science', 'Commerce'] },
  'Class 12': { streams: ['Bio-Maths', 'Computer Science', 'Commerce'] },
  College: {
    streams: ['Engineering', 'Arts and Science', 'Medical', 'Law', 'Architecture'],
  },
  'Competitive Exam': { streams: ['UPSC', 'TNPSC', 'GATE', 'CSAT'] },
};

const facultyGrades = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

const allSubjects = Object.values(gradeSubjectMap).flatMap(level => {
    if (Array.isArray(level)) {
        return level.flatMap(category => category.subjects.map(s => s.name));
    } else {
        return Object.values(level).flatMap(stream => stream.flatMap(category => category.subjects.map(s => s.name)));
    }
});
const uniqueFacultySubjects = [...new Set(allSubjects)];


export default function ProfileSettingsPage() {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const isFaculty = useMemo(() => pathname.includes('/admin'), [pathname]);

  // Mocking profile data since there is no database
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [name, setName] = useState('');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatars[0].url);
  
  const [gradeLevel, setGradeLevel] = useState('');
  const [stream, setStream] = useState('');

  const [handledGrades, setHandledGrades] = useState<string[]>([]);
  const [handledSubjects, setHandledSubjects] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoSaving, setIsPhotoSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
        setName(user.displayName || '');
        setCurrentAvatarUrl(user.photoURL || avatars[0].url);
        
        // Mock fetching profile
        setIsProfileLoading(true);
        setTimeout(() => {
            const mockProfile = {
                handledGrades: ['Class 8', 'Class 9'],
                handledSubjects: ['Mathematics', 'Physics'],
                gradeLevel: 'Class 8',
                stream: '',
                role: isFaculty ? 'faculty' : 'student',
            };
            setUserProfile(mockProfile);
            
            if(isFaculty) {
                setHandledGrades(mockProfile.handledGrades || []);
                setHandledSubjects(mockProfile.handledSubjects || []);
            } else {
                setGradeLevel(mockProfile.gradeLevel || '');
                setStream(mockProfile.stream || '');
            }
            setIsProfileLoading(false);
        }, 500);

    } else if (!isUserLoading) {
        setIsProfileLoading(false);
    }
  }, [user, isUserLoading, isFaculty]);


  const selectedGradeConfig = gradeConfig[gradeLevel as keyof typeof gradeConfig];
  
  const userInitial = name.split(' ').map((n) => n[0]).join('') || (isFaculty ? 'F' : 'U');

  const handleSaveChanges = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not authenticated' });
      return;
    }
    setIsSaving(true);
    
    try {
        if (user.displayName !== name) {
            await updateProfile(user, { displayName: name });
        }
        
        // Mock saving data
        console.log("Mock saving profile data:", {
            displayName: name,
            email: user.email,
            photoURL: currentAvatarUrl,
            ...(isFaculty ? { handledGrades, handledSubjects, role: 'faculty' } : { gradeLevel, stream, role: 'student' })
        });
        
        // Optimistically update local state
        setUserProfile((prev: any) => ({
             ...prev,
            ...(isFaculty ? { handledGrades, handledSubjects } : { gradeLevel, stream })
        }));
        
        toast({
            title: 'Profile Updated',
            description: 'Your personal information has been saved.',
        });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    }
    
    setIsSaving(false);
  };

  const handleSavePhoto = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Not authenticated' });
        return;
    }
    setIsPhotoSaving(true);

    try {
        await updateProfile(user, { photoURL: currentAvatarUrl });
        
        // Mock saving photo URL to DB
        console.log("Mock saving photoURL:", currentAvatarUrl);

        toast({ title: 'Avatar Updated!', description: 'Your new profile picture has been saved.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Avatar Update Failed', description: error.message });
    } finally {
        setIsPhotoSaving(false);
    }
  };

  const onGradeCheckedChange = (grade: string, isChecked: boolean) => {
    setHandledGrades(prev => isChecked ? [...prev, grade] : prev.filter(g => g !== grade));
  };
  const onSubjectCheckedChange = (subject: string, isChecked: boolean) => {
    setHandledSubjects(prev => isChecked ? [...prev, subject] : prev.filter(s => s !== subject));
  };
  
  const isLoading = isUserLoading || isProfileLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">{isFaculty ? "Faculty Profile" : "Profile Settings"}</h1>
        <p className="text-muted-foreground">
          Manage your personal information and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Select a new avatar for your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              {isLoading ? (
                 <Skeleton className="w-32 h-32 rounded-full" />
              ) : (
                <Avatar className="w-32 h-32 border-4 border-primary/20">
                  <AvatarImage src={currentAvatarUrl} alt={name} />
                  <AvatarFallback className="text-4xl">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              )}
               <AvatarSelector
                currentAvatarUrl={currentAvatarUrl}
                onSelect={setCurrentAvatarUrl}
               />
            </CardContent>
             <CardFooter>
              <Button
                size="lg"
                onClick={handleSavePhoto}
                disabled={isPhotoSaving || isLoading}
                className="w-full"
              >
                {isPhotoSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                {isPhotoSaving ? 'Saving...' : 'Save Avatar'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your name and {isFaculty ? 'teaching specializations' : 'grade level'}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {isLoading ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                   <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
               ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      <User className="inline-block mr-2" /> Full Name
                    </Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 text-base" />
                  </div>
                  
                  {isFaculty ? (
                    <>
                      <div className="space-y-4">
                        <Label><Briefcase className="inline-block mr-2" />Handled Grades</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md">
                            {facultyGrades.map(g => (
                                <div key={g} className="flex items-center space-x-2">
                                    <Checkbox id={`grade-${g}`} checked={handledGrades.includes(g)} onCheckedChange={(checked) => onGradeCheckedChange(g, !!checked)} />
                                    <Label htmlFor={`grade-${g}`} className="font-normal">{g}</Label>
                                </div>
                            ))}
                        </div>
                      </div>
                       <div className="space-y-4">
                        <Label><Briefcase className="inline-block mr-2" />Handled Subjects</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-md max-h-60 overflow-y-auto">
                            {uniqueFacultySubjects.map(s => (
                                <div key={s} className="flex items-center space-x-2">
                                    <Checkbox id={`subj-${s}`} checked={handledSubjects.includes(s)} onCheckedChange={(checked) => onSubjectCheckedChange(s, !!checked)} />
                                    <Label htmlFor={`subj-${s}`} className="font-normal">{s}</Label>
                                </div>
                            ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="gradeLevel">
                          <GraduationCap className="inline-block mr-2" /> Grade / Level
                        </Label>
                        <Select value={gradeLevel} onValueChange={(value) => { setGradeLevel(value); setStream(''); }}>
                          <SelectTrigger id="gradeLevel" className="h-12 text-base"><SelectValue placeholder="Select your grade or level" /></SelectTrigger>
                          <SelectContent>
                            {Object.keys(gradeConfig).map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>

                      {gradeLevel && selectedGradeConfig?.streams && (
                        <div className="space-y-2 animate-fade-in">
                          <Label htmlFor="stream">Stream / Exam</Label>
                          <Select value={stream} onValueChange={setStream} required>
                            <SelectTrigger id="stream" className="h-12 text-base"><SelectValue placeholder="Select your stream or exam" /></SelectTrigger>
                            <SelectContent>
                              {selectedGradeConfig.streams.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button size="lg" onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

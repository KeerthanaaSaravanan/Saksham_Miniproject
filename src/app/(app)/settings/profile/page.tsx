'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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
import {
  User,
  GraduationCap,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser, useFirestore } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AvatarSelector } from '@/components/AvatarSelector';

const gradeConfig = {
  'Class 6': { subjects: true },
  'Class 7': { subjects: true },
  'Class 8': { subjects: true },
  'Class 9': { subjects: true },
  'Class 10': { subjects: true },
  'Class 11': { streams: ['Bio Math', 'Computer Science', 'Commerce'] },
  'Class 12': { streams: ['Bio Math', 'Computer Science', 'Commerce'] },
  College: {
    streams: ['Engineering', 'Arts and Science', 'Medical', 'Law', 'Architecture'],
  },
  'Competitive Exam': { streams: ['UPSC', 'TNPSC', 'GATE', 'CSAT'] },
};

export default function ProfileSettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [stream, setStream] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoSaving, setIsPhotoSaving] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    if (user && firestore) {
      const initialPhoto = user.photoURL || `https://picsum.photos/seed/${user.uid}/128/128`;
      setName(user.displayName || '');
      setProfileImage(initialPhoto);
      setNewProfileImage(initialPhoto); // Initialize newProfileImage with current photo
      
      const fetchUserProfile = async () => {
        setIsProfileLoading(true);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setGrade(userData.grade || '');
          setStream(userData.stream || '');
        }
        setIsProfileLoading(false);
      };

      fetchUserProfile();
    } else if (!isUserLoading) {
        setIsProfileLoading(false);
    }
  }, [user, firestore, isUserLoading]);

  const selectedGradeConfig = gradeConfig[grade as keyof typeof gradeConfig];
  
  const userInitial = name.split(' ').map((n) => n[0]).join('') || 'U';

  const handleSavePhoto = async () => {
    if (!user || !newProfileImage) {
        toast({ variant: 'destructive', title: 'No new avatar selected' });
        return;
    }
    if (newProfileImage === profileImage) {
        toast({ title: 'No Changes', description: 'The selected avatar is already your profile picture.' });
        return;
    }
    setIsPhotoSaving(true);
    try {
        await updateProfile(user, { photoURL: newProfileImage });
        setProfileImage(newProfileImage);
        toast({
            title: 'Avatar Updated',
            description: 'Your new avatar has been saved.',
        });
    } catch (error: any) {
        let description = 'An unknown error occurred. Please try again.';
        if (error.code === 'auth/network-request-failed' || error.code === 'auth/unauthorized-domain') {
          description = 'A network error occurred. Please check your connection and ensure this domain is added to the authorized domains in your Firebase console.';
        } else if (error.message) {
          description = error.message;
        }
        toast({
            variant: 'destructive',
            title: 'Avatar Update Failed',
            description: description,
        });
    } finally {
        setIsPhotoSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Not authenticated or database not ready' });
      return;
    }
    setIsSaving(true);
    
    try {
      await updateProfile(user, {
        displayName: name,
      });

      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
          grade: grade,
          stream: stream,
      }, { merge: true });

      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Profile Settings</h1>
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
                Select a new avatar.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              {isUserLoading ? (
                 <Skeleton className="w-32 h-32 rounded-full" />
              ) : (
                <Avatar className="w-32 h-32 border-4 border-primary/20">
                  <AvatarImage src={newProfileImage || profileImage} alt={name} />
                  <AvatarFallback className="text-4xl">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              )}

              <AvatarSelector
                currentAvatarUrl={newProfileImage || ''}
                onSelect={(url) => setNewProfileImage(url)}
              />

            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={handleSavePhoto}
                    disabled={!newProfileImage || isPhotoSaving || newProfileImage === profileImage}
                >
                    {isPhotoSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
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
                Update your name and grade level.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {isUserLoading || isProfileLoading ? (
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
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">
                      <GraduationCap className="inline-block mr-2" /> Grade / Level
                    </Label>
                    <Select
                      value={grade}
                      onValueChange={(value) => {
                        setGrade(value);
                        setStream('');
                      }}
                    >
                      <SelectTrigger id="grade" className="h-12 text-base">
                        <SelectValue placeholder="Select your grade or level" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(gradeConfig).map((g) => (
                          <SelectItem key={g} value={g}>
                            {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {grade && selectedGradeConfig?.streams && (
                    <div className="space-y-2 animate-fade-in">
                      <Label htmlFor="stream">Stream / Exam</Label>
                      <Select value={stream} onValueChange={setStream} required>
                        <SelectTrigger id="stream" className="h-12 text-base">
                          <SelectValue placeholder="Select your stream or exam" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedGradeConfig.streams.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                onClick={handleSaveChanges}
                disabled={isSaving || isUserLoading || isProfileLoading}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
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
import { User, GraduationCap, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { avatars } from '@/lib/avatars';
import { AvatarSelector } from '@/components/AvatarSelector';

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

export default function ProfileSettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [stream, setStream] = useState('');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(avatars[0].url);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoSaving, setIsPhotoSaving] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    // Only proceed if user and firestore are available
    if (user && firestore) {
      const fetchUserProfile = async () => {
        setIsProfileLoading(true);
        setName(user.displayName || '');
        setCurrentAvatarUrl(user.photoURL || avatars[0].url);
        
        const userDocRef = doc(firestore, 'users', user.uid);
        try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              setGrade(userData.grade || '');
              setStream(userData.stream || '');
            }
        } catch (error: any) {
            console.error("Error fetching user profile:", error);
            toast({
                variant: 'destructive',
                title: 'Could not load profile',
                description: error.code === 'unavailable' ? 'Could not connect to the database. Please check your connection.' : 'An error occurred while loading your profile.',
            })
        } finally {
            setIsProfileLoading(false);
        }
      };

      fetchUserProfile();
    } else if (!isUserLoading && !firestore) { // If not loading and firestore is missing
        setIsProfileLoading(false);
        toast({
            variant: 'destructive',
            title: 'Database connection not available',
            description: 'Could not connect to Firestore. Please try again later.',
        });
    } else if (!isUserLoading) { // If not loading and user is null
        setIsProfileLoading(false);
    }
  }, [user, firestore, isUserLoading, toast]);


  const selectedGradeConfig = gradeConfig[grade as keyof typeof gradeConfig];
  
  const userInitial = name.split(' ').map((n) => n[0]).join('') || 'U';

  const handleSaveChanges = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Not authenticated or database not ready' });
      return;
    }
    setIsSaving(true);
    
    try {
      if(user.displayName !== name) {
        await updateProfile(user, { displayName: name });
      }

      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
          displayName: name,
          grade: grade,
          stream: stream,
      }, { merge: true });

      toast({
        title: 'Profile Updated',
        description: 'Your personal information has been saved.',
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

  const handleSavePhoto = async () => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Not authenticated or database not ready' });
        return;
    }
    setIsPhotoSaving(true);
    try {
        await updateProfile(user, {
            photoURL: currentAvatarUrl,
        });

        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, {
          photoURL: currentAvatarUrl,
        }, { merge: true });

        toast({
            title: 'Avatar Updated!',
            description: 'Your new profile picture has been saved.',
        });
    } catch (error: any) {
        let description = 'An unknown error occurred.';
        if (error.code === 'auth/network-request-failed' || error.code === 'auth/unauthorized-domain') {
            description = 'Network error: Please check your connection and ensure this domain is authorized in your Firebase console for authentication operations.';
        } else {
            description = error.message;
        }
        toast({
            variant: 'destructive',
            title: 'Photo Upload Failed',
            description,
        });
    } finally {
        setIsPhotoSaving(false);
    }
  };
  
  const isLoading = isUserLoading || isProfileLoading;

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
                {isPhotoSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="mr-2 h-4 w-4" />
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
                disabled={isSaving || isLoading}
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

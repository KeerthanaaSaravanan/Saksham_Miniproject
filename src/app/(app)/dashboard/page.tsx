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
import { useAuth, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc, collection, query, where, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getSubjectsForGrade, SubjectCategory } from '@/lib/subjects';
import { useCollection } from '@/firebase/firestore/use-collection';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface Exam {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  startTime: Timestamp;
}

interface AccessibilityProfile {
  visual?: boolean;
  hearing?: boolean;
  motor?: boolean;
  sld?: boolean;
  cognitive?: boolean;
}

const getPersonalizedGreeting = (name: string, profile?: AccessibilityProfile): string => {
    if (!profile) {
        return `Here's what's on your schedule. Let's get started.`;
    }
    if (profile.visual) {
        return "We’ve fine-tuned your view and added enhanced voice guidance for a smoother experience.";
    }
    if (profile.hearing) {
        return "We’ve made sure everything you need is clearly on-screen with visual alerts ready for you.";
    }
    if (profile.motor) {
        return "We’ve made your controls hands-free and easier to navigate — just speak or move naturally.";
    }
    if (profile.sld) {
        return "We’ve made your screen simpler and your reading experience smoother for better focus.";
    }
    if (profile.cognitive) {
        return "We’ve set up a calm, step-by-step exam view to help you stay relaxed and focused.";
    }
    return `Here's what's on your schedule. Let's get started.`;
};


export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [grade, setGrade] = useState('');
  const [stream, setStream] = useState('');
  const [subjects, setSubjects] = useState<SubjectCategory[]>([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [accessibilityProfile, setAccessibilityProfile] = useState<AccessibilityProfile | undefined>(undefined);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    if (user && firestore) {
      const fetchUserProfile = async () => {
        setIsProfileLoading(true);
        const userDocRef = doc(firestore, 'users', user.uid);
        const accessibilityProfileRef = doc(firestore, 'users', user.uid, 'accessibility_profile', 'settings');
        
        try {
          const [userDocSnap, accessibilityDocSnap] = await Promise.all([
              getDoc(userDocRef),
              getDoc(accessibilityProfileRef)
          ]);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const userGrade = userData.grade || '';
            const userStream = userData.stream || '';
            setGrade(userGrade);
            setStream(userStream);
            setSubjects(getSubjectsForGrade(userGrade, userStream));
          }

          if (accessibilityDocSnap.exists()) {
              const profileData = accessibilityDocSnap.data() as AccessibilityProfile;
              setAccessibilityProfile(profileData);
              setWelcomeMessage(getPersonalizedGreeting(user.displayName || 'Student', profileData));
          } else {
              setWelcomeMessage(getPersonalizedGreeting(user.displayName || 'Student'));
          }

        } catch (error) {
          console.error('Error fetching user profile:', error);
          setWelcomeMessage(getPersonalizedGreeting(user.displayName || 'Student'));
        } finally {
          setIsProfileLoading(false);
        }
      };
      fetchUserProfile();
    } else if (!isUserLoading) {
      setIsProfileLoading(false);
      setWelcomeMessage(getPersonalizedGreeting('Student'));
    }
  }, [user, firestore, isUserLoading]);

  const examsQuery = useMemoFirebase(() => {
    if (!firestore || !grade) return null;
    return query(
      collection(firestore, 'exams'),
      where('gradeLevel', '==', grade)
    );
  }, [firestore, grade]);

  const { data: exams, isLoading: areExamsLoading } = useCollection<Exam>(examsQuery);

  const getSubjectImage = (subjectId: string) => {
    return PlaceHolderImages.find(img => img.id === subjectId)?.imageUrl || 'https://picsum.photos/seed/placeholder/600/400';
  };

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
    }
    router.push('/');
  };

  const userName = user?.displayName || 'Student';
  const userInitial =
    userName
      .split(' ')
      .map((n) => n[0])
      .join('') || 'U';
  const isLoading = isUserLoading || isProfileLoading;

  return (
    <div className="space-y-8 text-foreground">
      <main>
        <div className="bg-gradient-to-r from-primary/80 to-accent/80 p-8 rounded-xl relative overflow-hidden text-primary-foreground shadow-lg">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {isLoading ? (
                <Skeleton className="h-12 w-48 rounded-md" />
              ) : (
                <>
                  <div className="text-3xl">👋</div>
                  <div>
                    <h2 className="text-3xl font-bold">Welcome back, {userName}!</h2>
                    <p className="opacity-80 max-w-lg">
                        {welcomeMessage}
                    </p>
                  </div>
                </>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-12 w-12 cursor-pointer border-2 border-white/50">
                  {isLoading ? (
                    <Skeleton className="h-12 w-12 rounded-full" />
                  ) : (
                    <>
                      <AvatarImage src={user?.photoURL || ''} alt={userName} />
                      <AvatarFallback>{userInitial}</AvatarFallback>
                    </>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push('/settings/profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push('/settings/accessibility')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Accessibility</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          { !isLoading && grade &&
            <div className="mt-6 flex gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    {grade}
                </Badge>
                {stream && (
                    <Badge variant="secondary" className="bg-white/20 text-white">
                       {stream}
                    </Badge>
                )}
            </div>
          }
        </div>

        <section className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-foreground">My Subjects</h3>
          {isLoading ? (
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
                            <Card key={subject.id} className="bg-card/80 border flex flex-col">
                            <CardHeader className="relative h-28 p-0 overflow-hidden rounded-t-lg">
                                <Image src={getSubjectImage(subject.id)} alt={subject.name} fill style={{ objectFit: 'cover' }} data-ai-hint={`${subject.id} abstract`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <CardTitle className="absolute bottom-4 left-4 text-primary-foreground">{subject.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 flex-1">
                                <h4 className="text-sm font-semibold mb-2">Upcoming Exams</h4>
                                {areExamsLoading ? <Skeleton className="h-10 w-full" /> : (
                                    <div className="space-y-2">
                                    {exams?.filter(exam => exam.subject.toLowerCase() === subject.name.toLowerCase()).length > 0 ? (
                                        exams?.filter(exam => exam.subject.toLowerCase() === subject.name.toLowerCase()).map(exam => (
                                        <div key={exam.id} className="text-xs p-2 rounded-md bg-muted/50 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-foreground">{exam.title}</p>
                                                <p className="text-muted-foreground">
                                                    {exam.startTime.toDate().toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => router.push('/assessment')}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted-foreground">No exams scheduled.</p>
                                    )}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                    <Button variant="outline" className="w-full" onClick={() => router.push('/practice')}>
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
            <p className="text-muted-foreground">No subjects found for your grade. Please complete your profile.</p>
          )}
        </section>

        <section className="mt-8">
          <h3 className="text-xl font-bold text-foreground mb-4">My Performance</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card/80 border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">No results yet. Complete an exam to see your performance.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/80 border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Practice Test Scores</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">No practice tests taken yet. Head to the practice zone!</p>
                    </CardContent>
                </Card>
           </div>
        </section>
      </main>
    </div>
  );
}

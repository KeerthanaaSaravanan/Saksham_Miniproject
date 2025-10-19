'use client';

import {
  Award,
  BookOpen,
  Mic,
  Zap,
  Eye,
  BarChart,
  FileText,
  CheckCircle,
  User,
  LogOut,
  Settings,
  GraduationCap,
  Upload,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { useAuth } from '@/firebase';

export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
    }
    router.push('/');
  };

  return (
    <div className="space-y-8 text-foreground">
      <main>
        <div className="bg-gradient-to-r from-primary to-accent p-8 rounded-xl relative overflow-hidden text-primary-foreground shadow-lg">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="text-3xl">👋</div>
              <div>
                <h2 className="text-3xl font-bold">Hello Arjun Sharma!</h2>
                <p className="opacity-80">
                  Your AI learning companion is ready to assist you.
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-12 w-12 cursor-pointer border-2 border-white/50">
                  <AvatarImage
                    src="https://picsum.photos/seed/arjun/64/64"
                    alt="Arjun Sharma"
                  />
                  <AvatarFallback>AS</AvatarFallback>
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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/20 p-4 rounded-lg flex items-center gap-3">
              <Brain className="w-5 h-5" />
              <span>
                AI Optimization <br /> 5 modules active
              </span>
            </div>
            <div className="bg-white/20 p-4 rounded-lg flex items-center gap-3">
              <Eye className="w-5 h-5" />
              <span>
                Smart Proctoring <br /> Ready for exams
              </span>
            </div>
            <div className="bg-white/20 p-4 rounded-lg flex items-center gap-3">
              <Mic className="w-5 h-5" />
              <span>
                Voice Assistant <br /> Always listening
              </span>
            </div>
          </div>
        </div>

        <section className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-foreground">
            AI-Enhanced Academic Journey
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-card/80 border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">12</div>
                    <p className="text-muted-foreground text-sm">
                      AI-Enhanced Exams
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/20 rounded-lg">
                    <Mic className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">47</div>
                    <p className="text-muted-foreground text-sm">
                      Voice Sessions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/20 rounded-lg">
                    <Zap className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">98%</div>
                    <p className="text-muted-foreground text-sm">
                      Accessibility Score
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Award className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">18</div>
                    <p className="text-muted-foreground text-sm">
                      AI Achievements
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-foreground">
              AI-Proctored Examinations
            </h3>
            <Button variant="ghost" className="text-primary">
              View AI Features
            </Button>
          </div>
          <div className="space-y-4">
            <Card className="bg-card/80 border p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">
                    Mathematics (AI-Enhanced){' '}
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-green-500/20 text-green-400"
                    >
                      AI Proctored
                    </Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Dec 25, 2024 @ 10:00 AM • 2 hours
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge
                      variant="outline"
                      className="border-blue-400 text-blue-400"
                    >
                      Voice Navigation
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-blue-400 text-blue-400"
                    >
                      Large Text
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-blue-400 text-blue-400"
                    >
                      AI Reading
                    </Badge>
                  </div>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Start AI Exam
              </Button>
            </Card>

            <Card className="bg-card/80 border p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold">Physics (AI-Enhanced)</h4>
                  <p className="text-xs text-muted-foreground">
                    Dec 28, 2024 @ 2:00 PM • 1.5 hours
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge
                      variant="outline"
                      className="border-blue-400 text-blue-400"
                    >
                      Speech-to-Text
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-blue-400 text-blue-400"
                    >
                      Equation Reader
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-blue-400 text-blue-400"
                    >
                      Time Reminders
                    </Badge>
                  </div>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Start AI Exam
              </Button>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}

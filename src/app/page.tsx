
'use client';

import { useState, useEffect } from 'react';
import WelcomeSection from '@/components/welcome-section';
import LoginForm from '@/components/LoginForm';
import { AdminLoginForm } from '@/components/AdminLoginForm';
import { Brain, GraduationCap, Mic, User, Briefcase, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

type LoginMode = 'student' | 'faculty';

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('student');
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // If the user is logged in and we're done loading, redirect them.
    if (!isUserLoading && user) {
        if(user.email === 'dakshata@gmail.com') { // A simple way to distinguish faculty for this demo
             router.replace('/admin/dashboard');
        } else {
            router.replace('/dashboard');
        }
    }
  }, [user, isUserLoading, router]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };
  
  if (isUserLoading || user) {
    // Show a blank screen or a loading spinner while checking auth or redirecting
    return <div className="min-h-screen bg-background" />;
  }

  if (showWelcome && isClient) {
    return <WelcomeSection onComplete={handleWelcomeComplete} />;
  }
  
  if (!isClient) {
    return null; // Render nothing on the server
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/50 to-purple-50/50 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 flex items-center justify-center p-4 transition-all duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-48 h-48 bg-primary/10 rounded-full opacity-50 blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-64 h-64 bg-accent/10 rounded-full opacity-50 blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full opacity-50 blur-2xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>
      <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div className="text-center lg:text-left space-y-8 animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="font-poppins font-bold text-4xl text-foreground">
                  SAKSHAM
                </h1>
                <p className="font-inter text-sm text-muted-foreground -mt-1 tracking-wide">
                  AI-Powered Dignity-First Learning
                </p>
              </div>
            </div>

            <h2 className="font-montserrat font-extrabold text-3xl lg:text-5xl text-foreground leading-tight">
              Welcome to Your
              <span className="block text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text mt-1">
                Autonomous Journey
              </span>
            </h2>

            <p className="font-inter text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Experience AI-powered examinations that adapt silently to enhance
              your performance — no scribes needed, complete autonomy assured.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
            <div className="flex flex-col items-center lg:items-start space-y-2 p-3 bg-card/50 backdrop-blur-sm rounded-lg border hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <span className="font-inter text-sm font-medium text-muted-foreground text-center lg:text-left">
                AI Optimization
              </span>
            </div>

            <div className="flex flex-col items-center lg:items-start space-y-2 p-3 bg-card/50 backdrop-blur-sm rounded-lg border hover:shadow-accent/10 hover:border-accent/30 transition-all duration-300">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-accent" />
              </div>
              <span className="font-inter text-sm font-medium text-muted-foreground text-center lg:text-left">
                Smart Proctoring
              </span>
            </div>
            
            <div className="flex flex-col items-center lg:items-start space-y-2 p-3 bg-card/50 backdrop-blur-sm rounded-lg border hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-blue-500" />
              </div>
              <span className="font-inter text-sm font-medium text-muted-foreground text-center lg:text-left">
                Voice Assistant
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center lg:justify-start space-x-3 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="font-inter text-sm text-foreground font-medium">
              AI Assistant Ready • 5 Adaptive Modules Active
            </span>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
           <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-1.5 flex gap-1.5 mb-4">
            <button
                onClick={() => setLoginMode('student')}
                className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors duration-300",
                    loginMode === 'student' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' : 'text-muted-foreground hover:text-foreground'
                )}
            >
                <User className="h-4 w-4" />
                Student
            </button>
            <button
                onClick={() => setLoginMode('faculty')}
                className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors duration-300",
                    loginMode === 'faculty' ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30' : 'text-muted-foreground hover:text-foreground'
                )}
            >
                <Briefcase className="h-4 w-4" />
                Faculty
            </button>
           </div>
           {loginMode === 'student' ? <LoginForm /> : <AdminLoginForm />}
        </div>
      </div>
    </div>
  );
}

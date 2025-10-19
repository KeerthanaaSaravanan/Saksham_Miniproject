'use client';

import { useState, useEffect } from 'react';
import WelcomeSection from '@/components/welcome-section';
import LoginForm from '@/components/LoginForm';
import { AdminLoginForm } from '@/components/AdminLoginForm';
import { Eye, GraduationCap, Heart, User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

type LoginMode = 'student' | 'faculty';

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [loginMode, setLoginMode] = useState<LoginMode>('student');

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  if (!isClient) {
    return null; // Render nothing on the server
  }

  if (showWelcome) {
    return <WelcomeSection onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] via-[#E8F4F8] to-[#D6EDF6] dark:from-[#0B1426] dark:via-[#111B2E] dark:to-[#1A2642] flex items-center justify-center p-4 transition-all duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-48 h-48 bg-blue-500/10 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent/10 rounded-full opacity-10 blur-2xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>
      <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="text-center lg:text-left space-y-8 animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-poppins font-bold text-3xl text-foreground">
                  SAKSHAM
                </h1>
                <p className="font-inter text-sm text-muted-foreground -mt-1">
                  AI-Powered Dignity-First Learning
                </p>
              </div>
            </div>

            <h2 className="font-montserrat font-bold text-2xl lg:text-4xl text-foreground leading-tight">
              Welcome to Your
              <span className="block text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
                Autonomous Examination Journey
              </span>
            </h2>

            <p className="font-inter text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Experience AI-powered examinations that adapt silently to enhance
              your performance — no scribes needed, complete autonomy assured.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
            <div className="flex flex-col items-center lg:items-start space-y-2 p-3 bg-card rounded-lg border hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <span className="font-inter text-sm text-muted-foreground text-center lg:text-left">
                AI Vision Assistant
              </span>
            </div>

            <div className="flex flex-col items-center lg:items-start space-y-2 p-3 bg-card rounded-lg border hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent" />
              </div>
              <span className="font-inter text-sm text-muted-foreground text-center lg:text-left">
                Emotion-Aware AI
              </span>
            </div>

            <div className="flex flex-col items-center lg:items-start space-y-2 p-3 bg-card rounded-lg border hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-500" />
              </div>
              <span className="font-inter text-sm text-muted-foreground text-center lg:text-left">
                Smart Proctoring
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
           <div className="bg-card rounded-2xl shadow-xl border p-1.5 flex gap-1.5 mb-4">
            <button
                onClick={() => setLoginMode('student')}
                className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors",
                    loginMode === 'student' ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-muted/50'
                )}
            >
                <User className="h-4 w-4" />
                Student
            </button>
            <button
                onClick={() => setLoginMode('faculty')}
                className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors",
                    loginMode === 'faculty' ? 'bg-primary text-primary-foreground shadow' : 'hover:bg-muted/50'
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

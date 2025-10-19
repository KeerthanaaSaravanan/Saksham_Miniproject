'use client';
import { useState, useEffect } from 'react';
import { Eye, GraduationCap, Heart, User } from 'lucide-react';
import WelcomeSection from '@/components/welcome-section';
import LoginForm from '@/components/LoginForm';

export default function HomePage() {
  const [userType, setUserType] = useState('student');
  const [showWelcome, setShowWelcome] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Auto-hide welcome after 4 seconds for better AI experience
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  if (showWelcome) {
    return <WelcomeSection onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] via-[#E8F4F8] to-[#D6EDF6] dark:from-[#0B1426] dark:via-[#111B2E] dark:to-[#1A2642] flex items-center justify-center p-4 transition-all duration-300">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#38C5B0] dark:bg-[#2DD4BF] rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-10 right-10 w-48 h-48 bg-[#3B82F6] dark:bg-[#60A5FA] rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#8B5CF6] dark:bg-[#A78BFA] rounded-full opacity-10 blur-2xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
      </div>

      {/* Main login container */}
      <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left side - Branding and messaging */}
        <div className="text-center lg:text-left space-y-8">
          {/* Logo and title */}
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#38C5B0] to-[#2DD4BF] rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-poppins font-bold text-3xl text-[#0B1426] dark:text-white">
                  SAKSHAM
                </h1>
                <p className="font-inter text-sm text-muted-foreground -mt-1">
                  AI-Powered Dignity-First Learning
                </p>
              </div>
            </div>

            <h2 className="font-montserrat font-bold text-2xl lg:text-4xl text-[#0B1426] dark:text-white leading-tight">
              Welcome to Your
              <span className="block text-transparent bg-gradient-to-r from-[#38C5B0] to-[#3B82F6] bg-clip-text">
                Autonomous Examination Journey
              </span>
            </h2>

            <p className="font-inter text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
              Experience AI-powered examinations that adapt silently to enhance
              your performance — no scribes needed, complete autonomy assured.
            </p>
          </div>

          {/* AI-powered feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
            <div className="flex flex-col items-center lg:items-start space-y-2 p-3 bg-white dark:bg-[#1E293B] rounded-lg border border-border hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-[#DDF7F5] dark:bg-[#1A2F2B] rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#38C5B0]" />
              </div>
              <span className="font-inter text-sm text-muted-foreground text-center lg:text-left">
                AI Vision Assistant
              </span>
            </div>

            <div className="flex flex-col items-center lg:items-start space-y-2 p-3 bg-white dark:bg-[#1E293B] rounded-lg border border-border hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-[#EFE9FF] dark:bg-[#2A2440] rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <span className="font-inter text-sm text-muted-foreground text-center lg:text-left">
                Emotion-Aware AI
              </span>
            </div>

            <div className="flex flex-col items-center lg:items-start space-y-2 p-3 bg-white dark:bg-[#1E293B] rounded-lg border border-border hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-[#E4F3FF] dark:bg-[#1A2E3D] rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <span className="font-inter text-sm text-muted-foreground text-center lg:text-left">
                Smart Proctoring
              </span>
            </div>
          </div>

          {/* AI Status Indicator */}
          <div className="flex items-center justify-center lg:justify-start space-x-3 p-4 bg-gradient-to-r from-[#38C5B0] to-[#2DD4BF] bg-opacity-10 rounded-xl border border-[#38C5B0] border-opacity-20">
            <div className="w-2 h-2 bg-[#38C5B0] rounded-full animate-pulse"></div>
            <span className="font-inter text-sm text-[#0B1426] dark:text-white font-medium">
              AI Assistant Ready • 5 Adaptive Modules Active
            </span>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-border p-8 space-y-6">
            {/* User type toggle */}
            <div className="flex bg-[#F1F5F9] dark:bg-[#0F172A] rounded-xl p-1">
              <button
                onClick={() => setUserType('student')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-inter font-medium text-sm transition-all duration-200 ${
                  userType === 'student'
                    ? 'bg-white dark:bg-[#1E293B] text-[#38C5B0] shadow-sm'
                    : 'text-muted-foreground hover:text-[#38C5B0]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>

              <button
                onClick={() => setUserType('faculty')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-inter font-medium text-sm transition-all duration-200 ${
                  userType === 'faculty'
                    ? 'bg-white dark:bg-[#1E293B] text-[#38C5B0] shadow-sm'
                    : 'text-muted-foreground hover:text-[#38C5B0]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Faculty</span>
              </button>
            </div>

            {/* Login form */}
            <LoginForm userType={userType} />
          </div>
        </div>
      </div>
    </div>
  );
}

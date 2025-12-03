
'use client';
import { useState, useEffect } from 'react';
import { GraduationCap, CheckCircle } from 'lucide-react';

export default function WelcomeSection({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const welcomeSteps = [
    {
      icon: GraduationCap,
      title: 'Welcome to SAKSHAM',
      subtitle: 'Your AI-Powered Examination Companion',
      message:
        "Hello! I'm your AI assistant ready to create a personalized learning environment just for you.",
      gradient: 'from-primary to-accent',
    },
    {
      icon: CheckCircle,
      title: 'Ready to Begin',
      subtitle: 'Your Autonomous Journey Starts Now',
      message:
        'Everything is configured for your success. Let\'s begin your dignified examination experience!',
      gradient: 'from-accent to-primary',
    },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    setIsPlaying(true);
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < welcomeSteps.length - 1) {
          return prev + 1;
        }
        // Last step, do not auto-advance, but trigger onComplete after a delay
        clearInterval(stepTimer); 
        setTimeout(onComplete, 2500);
        return prev;
      });
    }, 2500);


    return () => {
        clearInterval(stepTimer);
    };
  }, [isClient, onComplete, welcomeSteps.length]);

  if (!isClient) {
    return null; // Or a loading spinner
  }

  const currentWelcome = welcomeSteps[currentStep];
  const IconComponent = currentWelcome.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F9FC] via-[#E8F4F8] to-[#D6EDF6] dark:from-[#0B1426] dark:via-[#111B2E] dark:to-[#1A2642] flex items-center justify-center p-4 transition-all duration-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/20 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-48 h-48 bg-blue-500/20 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent/20 rounded-full opacity-20 blur-2xl animate-pulse"
          style={{ animationDelay: '3s' }}
        ></div>
      </div>

      <div className="relative text-center space-y-8 max-w-2xl mx-auto">
        <div className="flex justify-center">
          <div
            className={`w-24 h-24 bg-gradient-to-r ${
              currentWelcome.gradient
            } rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-700 ${
              isPlaying ? 'scale-110 rotate-3' : 'scale-100'
            }`}
          >
            <IconComponent className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="font-poppins font-bold text-4xl lg:text-5xl text-[#0B1426] dark:text-white transform transition-all duration-700">
            {currentWelcome.title}
          </h1>

          <h2
            className={`font-montserrat font-semibold text-xl lg:text-2xl text-transparent bg-gradient-to-r ${currentWelcome.gradient} bg-clip-text transform transition-all duration-700`}
          >
            {currentWelcome.subtitle}
          </h2>

          <p className="font-inter text-lg text-muted-foreground max-w-lg mx-auto transform transition-all duration-700">
            {currentWelcome.message}
          </p>
        </div>

        <div className="flex justify-center space-x-2">
          {welcomeSteps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? `bg-gradient-to-r ${currentWelcome.gradient}`
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={onComplete}
          className="absolute -bottom-8 right-0 font-inter text-sm text-muted-foreground hover:text-primary transition-colors duration-200 underline"
        >
          Skip Welcome
        </button>
      </div>
    </div>
  );
}

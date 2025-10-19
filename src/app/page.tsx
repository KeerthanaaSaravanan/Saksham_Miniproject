'use client';
import { useState, useEffect } from 'react';
import WelcomeSection from '@/components/welcome-section';
import LoginForm from '@/components/LoginForm';

export default function HomePage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Auto-hide welcome after 4 seconds
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <LoginForm />
      </div>
    </div>
  );
}

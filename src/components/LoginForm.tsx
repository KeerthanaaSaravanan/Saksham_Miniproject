
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import StudentDetailsForm from './StudentDetailsForm';
import { useVoiceControl } from './voice-control-provider';
import { avatars } from '@/lib/avatars';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsStep, setIsDetailsStep] = useState(false);
  const [newUser, setNewUser] = useState<User | null>(null);
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleVoiceInput = (event: Event) => {
        const customEvent = event as CustomEvent;
        const { field, value } = customEvent.detail;
        if (field === 'email') {
            setEmail(value);
        } else if (field === 'password') {
            setPassword(value);
        }
    };

    const handleVoiceSubmit = () => {
        const form = document.getElementById('login-form');
        if (form) {
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    };
    
    window.addEventListener('voice-input', handleVoiceInput);
    window.addEventListener('voice-submit', handleVoiceSubmit);

    return () => {
        window.removeEventListener('voice-input', handleVoiceInput);
        window.removeEventListener('voice-submit', handleVoiceSubmit);
    };
  }, []);

  const handleAuthError = (error: any) => {
    let description = 'An unknown error occurred. Please try again.';
    if (error.code === 'auth/network-request-failed') {
      description = 'A network error occurred. Please check your connection.';
    } else if (
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/invalid-credential'
    ) {
      description = 'Invalid email or password. Please try again.';
    } else if (error.message) {
      description = error.message;
    }
    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description: description,
    });
  };

  const handleAuthSuccess = (user: User) => {
    setNewUser(user);
    setIsDetailsStep(true);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({ variant: 'destructive', title: 'Error', description: 'Authentication service is not available.' });
      return;
    }
    if (!password) {
      toast({ variant: 'destructive', title: 'Password required', description: 'Please enter a password.' });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login Successful', description: 'Welcome back!' });
      router.push('/dashboard');
    } catch (signInError: any) {
      if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          toast({ title: 'Account Created', description: "Let's set up your profile." });
          handleAuthSuccess(userCredential.user);
        } catch (signUpError) {
          handleAuthError(signUpError);
        }
      } else {
        handleAuthError(signInError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onDetailsComplete = async (details: {name: string, gradeLevel: string, stream: string}) => {
    if (!newUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'User not available.' });
        return;
    }
    setIsLoading(true);
    const defaultAvatar = avatars.find(a => a.tags.includes('abstract'))?.url || avatars[0].url;

    try {
        await updateProfile(newUser, {
            displayName: details.name,
            photoURL: defaultAvatar,
        });
        
        // Mock saving other details
        console.log("Mock saving profile details:", {
            gradeLevel: details.gradeLevel,
            stream: details.stream,
        });

        toast({
            title: 'Profile Complete!',
            description: `Welcome, ${details.name}! Your learning path is set.`,
        });
        router.push('/dashboard');
        
    } catch (error: any) {
        handleAuthError(error);
    } finally {
        setIsLoading(false);
    }
  }

  if (isDetailsStep) {
    return <StudentDetailsForm onComplete={onDetailsComplete} isLoading={isLoading} />;
  }

  return (
    <div className="bg-card rounded-2xl shadow-xl border p-8 space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Student Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Create or access your student account.
        </p>
      </div>

      <form id="login-form" onSubmit={handleSignUp} className="space-y-4 w-full">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="h-12"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="h-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          By continuing, you agree to our{' '}
          <Link href="#" className="underline hover:text-primary">
            Terms of Service
          </Link>
          .
        </p>
        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue with Email
        </Button>
      </form>
    </div>
  );
}

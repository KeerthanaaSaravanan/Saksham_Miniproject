'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const handleAuthError = (error: any) => {
    console.error('Authentication error:', error);
    let description = 'An unknown error occurred. Please try again.';
    if (error.code === 'auth/unauthorized-domain') {
      description =
        "This domain is not authorized for authentication. Please add it to the authorized domains in your Firebase console.";
    } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = "Invalid email or password. Please try again.";
    }
     else if (error.message) {
      description = error.message;
    }
    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description: description,
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      console.error('Auth service is not available.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Authentication service is not available. Please try again later.',
      });
      return;
    }
    if (!password) {
      toast({
        variant: 'destructive',
        title: 'Password required',
        description: 'Please enter a password to sign up.',
      });
      return;
    }
    setIsLoading(true);
    try {
      // First, try to sign in. If it fails because the user doesn't exist, then create a new user.
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login Successful',
        description: "Welcome back!",
      });
      router.push('/dashboard');
    } catch (signInError: any) {
      if (signInError.code === 'auth/user-not-found') {
        // If user does not exist, create a new account
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          toast({
            title: 'Account Created',
            description: 'Your account has been successfully created.',
          });
          router.push('/dashboard');
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

      <form onSubmit={handleSignUp} className="space-y-4 w-full">
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
          className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue with Email
        </Button>
      </form>
    </div>
  );
}
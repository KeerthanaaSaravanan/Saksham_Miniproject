'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const handleAuthError = (error: any) => {
    console.error("Authentication error:", error);
    let description = "An unknown error occurred. Please try again.";
    if (error.code === 'auth/unauthorized-domain') {
      description = "This domain is not authorized for authentication. Please add it to the authorized domains in your Firebase console.";
    } else if (error.message) {
      description = error.message;
    }
    toast({
      variant: "destructive",
      title: "Authentication Failed",
      description: description,
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      console.error("Auth service is not available.");
      return;
    }
     if (!password) {
      toast({
        variant: "destructive",
        title: "Password required",
        description: "Please enter a password to sign up.",
      });
      return;
    }
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            // If email is already in use, try to sign in instead.
            try {
                await signInWithEmailAndPassword(auth, email, password);
                router.push('/dashboard');
            } catch (signInError) {
                handleAuthError(signInError);
            }
        } else {
            handleAuthError(error);
        }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl border p-8 space-y-6">
       <h1 className="text-3xl font-semibold text-center text-foreground">Create your account</h1>
      
      <div className="flex items-center w-full">
        <span className="px-4 text-sm text-muted-foreground w-full text-center">Sign up with your email</span>
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
        <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="#" className="underline hover:text-primary">
                Terms of Service
            </Link>
            .
        </p>
        <Button type="submit" className="w-full h-12 bg-foreground text-background hover:bg-foreground/90" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{' '}
        <Link href="#" className="underline hover:text-primary" onClick={(e) => {
            e.preventDefault();
            // This is a simple way to hint at login, the main button handles both
            toast({ title: "Please enter your details", description: "Enter your email and password to log in or sign up."});
        }}>
          Log in
        </Link>
      </p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, initiateEmailSignUp } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const auth = useAuth();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, faculty login is removed from this flow to match the image.
    // We can add it back if needed.
    initiateEmailSignUp(auth, email, ''); // Password field is not in the new design.
    router.push('/dashboard');
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.022,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
  );

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center space-y-6">
       <h1 className="text-3xl font-semibold text-center">Create your account</h1>
      
      <Button variant="outline" className="w-full h-12 text-base" onClick={handleGoogleSignIn}>
        <GoogleIcon />
        Sign up with Google
      </Button>

      <div className="flex items-center w-full">
        <Separator className="flex-1" />
        <span className="px-4 text-sm text-muted-foreground">Or</span>
        <Separator className="flex-1" />
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
          />
        </div>
        <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link href="#" className="underline hover:text-primary">
                Terms of Service
            </Link>
            .
        </p>
        <Button type="submit" className="w-full h-12 bg-gray-900 text-white hover:bg-gray-800">
          Sign up
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="#" className="underline hover:text-primary">
          Log in
        </Link>
      </p>
    </div>
  );
}

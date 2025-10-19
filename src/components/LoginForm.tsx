'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginForm({ userType }: { userType: 'student' | 'faculty' }) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === 'faculty') {
      router.push('/admin/dashboard');
    } else {
        router.push('/dashboard');
    }
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.28-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.022,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
  );

  if (userType === 'student') {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="outline" className="w-full h-12 text-base" onClick={handleLogin}>
          <GoogleIcon />
          Sign in with Google
        </Button>
        <div className="flex items-center">
          <Separator className="flex-1" />
          <span className="px-4 text-sm text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" placeholder="student@example.com" className="pl-10 h-12" />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 bg-gradient-to-r from-[#38C5B0] to-[#2DD4BF] hover:opacity-90">
            Sign in with Email
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="font-montserrat font-semibold text-xl text-center text-[#0B1426] dark:text-white">
        Faculty & Admin Login
      </h3>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="faculty-email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input id="faculty-email" type="email" placeholder="faculty@example.com" className="pl-10 h-12" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="faculty-password">Password</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="faculty-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 h-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Link href="#" className="text-sm font-inter text-muted-foreground hover:text-primary transition">
            Forgot Password?
          </Link>
        </div>
        <Button type="submit" className="w-full h-12 bg-gradient-to-r from-[#38C5B0] to-[#2DD4BF] hover:opacity-90">
          Login to Faculty Portal
        </Button>
      </form>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, AtSign, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export function AdminLoginForm() {
  const [email, setEmail] = useState('dakshata@gmail.com');
  const [password, setPassword] = useState('saksham');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Authentication service is not available.',
      });
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
          title: 'Login Successful',
          description: 'Welcome back to the Faculty Portal!',
      });
      router.push('/admin/dashboard');

    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            try {
                const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = newUserCredential.user;
                
                await updateProfile(user, { displayName: "Dakshata G" });

                // Mock saving faculty role
                console.log("Mock saving faculty role for user:", user.uid);

                toast({
                    title: 'Faculty Account Created',
                    description: 'Welcome to the Faculty Portal!',
                });
                router.push('/admin/dashboard');
            } catch (createError: any) {
                 toast({
                    variant: 'destructive',
                    title: 'Setup Failed',
                    description: `Could not create faculty account: ${createError.message}`,
                });
            }
        } else {
            let description = 'An unexpected error occurred.';
            if (error.code === 'auth/wrong-password') {
                description = 'Invalid email or password for faculty account.';
            } else if (error.code === 'auth/invalid-email') {
                description = 'The email address is not valid.';
            }
            
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: description,
            });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl border p-8 space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your faculty account
        </p>
      </div>

      <form onSubmit={handleAdminLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email Address</Label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="admin-email"
              type="email"
              placeholder="Enter your email"
              className="h-12 pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin-password">Password</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="h-12 pl-10 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="sr-only">
                {showPassword ? 'Hide password' : 'Show password'}
              </span>
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    </div>
  );
}

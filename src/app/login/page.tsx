'use client';

import { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Lock, Mail, Loader2, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';

function LoginFormContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login({ email, password });
    setIsSubmitting(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.message || 'Invalid email or password.');
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsSubmitting(true);
    setError(null);

    const res = await login({ email: demoEmail, password: demoPass });
    setIsSubmitting(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.message || 'Demo login failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Card className="shadow-xl border-border/80">
        <CardHeader className="text-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-foreground tracking-tight">Sign In</CardTitle>
          <CardDescription className="text-sm">
            Sign in to post items, claim found belongings, and connect with other students.
          </CardDescription>
          {redirectUrl !== '/dashboard' && (
            <div className="mt-2 text-xs bg-muted/60 text-muted-foreground p-2 rounded-md border text-center font-medium">
              You will be redirected back to continue your action after signing in.
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Login Buttons for Interview / Fast Demo */}
          <div className="pt-4 border-t border-border/60">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('finder1@example.com', 'password123')}
                disabled={isSubmitting}
                className="text-xs h-auto py-2 flex flex-col items-center text-center"
              >
                <span className="font-semibold text-foreground">Sam (Finder)</span>
                <span className="text-[10px] text-muted-foreground">Posted items</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin('student@campus.edu', 'password123')}
                disabled={isSubmitting}
                className="text-xs h-auto py-2 flex flex-col items-center text-center"
              >
                <span className="font-semibold text-foreground">Alex (Student)</span>
                <span className="text-[10px] text-muted-foreground">Claiming items</span>
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-4 text-xs text-muted-foreground">
          Don't have an account yet?{' '}
          <Link
            href={`/signup${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
            className="text-primary font-bold hover:underline ml-1"
          >
            Create one here
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-12 text-center text-muted-foreground">Loading login...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthSessionUser } from '@/types';
import { getCurrentUser, loginAction, logoutAction, signUpAction } from '@/lib/auth-actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: AuthSessionUser | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  signup: (data: { name: string; email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const current = await getCurrentUser();
      setUser(current);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await loginAction(data);
    if (res.success && res.user) {
      setUser(res.user);
      toast({ title: 'Welcome!', description: res.message });
      router.refresh();
      return { success: true };
    } else {
      toast({ title: 'Login Failed', description: res.message || 'Invalid credentials.', variant: 'destructive' });
      return { success: false, message: res.message };
    }
  };

  const signup = async (data: { name: string; email: string; password: string }) => {
    const res = await signUpAction(data);
    if (res.success && res.user) {
      setUser(res.user);
      toast({ title: 'Account Created', description: res.message });
      router.refresh();
      return { success: true };
    } else {
      toast({ title: 'Registration Failed', description: res.message || 'Failed to create account.', variant: 'destructive' });
      return { success: false, message: res.message };
    }
  };

  const logout = async () => {
    await logoutAction();
    setUser(null);
    toast({ title: 'Logged Out', description: 'You have been safely signed out.' });
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

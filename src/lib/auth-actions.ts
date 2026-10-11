'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { createUser, verifyUserPassword, getUserByEmail } from '@/lib/mock-data';
import type { AuthSessionUser } from '@/types';
import { revalidatePath } from 'next/cache';

const SESSION_COOKIE_NAME = 'campus_compass_session';

const SignUpSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function getCurrentUser(): Promise<AuthSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) return null;

    const decoded = Buffer.from(sessionCookie, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded) as AuthSessionUser;
    if (parsed && parsed.id && parsed.email) {
      return parsed;
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function signUpAction(formData: { name: string; email: string; password: string }) {
  try {
    const validated = SignUpSchema.parse(formData);

    const existing = await getUserByEmail(validated.email);
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser = await createUser({
      name: validated.name,
      email: validated.email,
      password: validated.password,
    });

    const sessionData: AuthSessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, Buffer.from(JSON.stringify(sessionData)).toString('base64'), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    revalidatePath('/');
    revalidatePath('/dashboard');

    return { 
      success: true, 
      message: 'Account created successfully! Welcome to Campus Compass.',
      user: sessionData 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Validation failed.', errors: error.flatten().fieldErrors };
    }
    console.error('Sign up error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Registration failed.' };
  }
}

export async function loginAction(formData: { email: string; password: string }) {
  try {
    const validated = LoginSchema.parse(formData);

    const user = await verifyUserPassword(validated.email, validated.password);
    if (!user) {
      return { success: false, message: 'Invalid email or password. Please try again.' };
    }

    const sessionData: AuthSessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, Buffer.from(JSON.stringify(sessionData)).toString('base64'), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    revalidatePath('/');
    revalidatePath('/dashboard');

    return { 
      success: true, 
      message: `Welcome back, ${user.name}!`, 
      user: sessionData 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Validation failed.', errors: error.flatten().fieldErrors };
    }
    console.error('Login error:', error);
    return { success: false, message: 'An unexpected error occurred during login.' };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/search-items');

    return { success: true, message: 'You have been logged out.' };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Failed to log out.' };
  }
}

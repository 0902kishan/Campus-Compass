'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useId } from 'react';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/search-items', label: 'Search Items' },
    { href: '/post-item', label: 'Post Found Item' },
    { href: '/dashboard', label: 'Dashboard & Claims' },
  ];

  const mobileNavTitleId = useId();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Icons.Logo className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">Campus Compass</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Button 
              key={item.label} 
              variant={item.href === '/dashboard' ? 'secondary' : 'ghost'} 
              size="sm"
              asChild
              className={item.href === '/dashboard' ? 'font-semibold border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20' : ''}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-medium">
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold text-foreground">{user.name}</span>
                <span className="text-muted-foreground text-[10px]">({user.email})</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => logout()} className="text-xs gap-1 text-muted-foreground hover:text-destructive">
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="text-xs font-semibold gap-1">
                <Link href="/login">
                  <LogIn className="w-3.5 h-3.5" /> Log In
                </Link>
              </Button>
              <Button size="sm" asChild className="text-xs font-semibold gap-1 shadow-sm">
                <Link href="/signup">
                  <UserPlus className="w-3.5 h-3.5" /> Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" aria-labelledby={mobileNavTitleId}>
              <VisuallyHidden asChild>
                <SheetTitle id={mobileNavTitleId}>Mobile Navigation Menu</SheetTitle>
              </VisuallyHidden>

              <div className="flex flex-col gap-4 mt-6">
                {user ? (
                  <div className="p-3 rounded-lg bg-secondary border text-xs mb-2">
                    <p className="font-bold text-foreground">{user.name}</p>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mb-2">
                    <Button asChild size="sm" className="w-full">
                      <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}

                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Button key={item.label} variant="ghost" asChild className="w-full justify-start text-base py-2.5">
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  ))}
                </nav>

                {user && (
                  <Button variant="destructive" size="sm" onClick={() => logout()} className="w-full mt-4 gap-1.5">
                    <LogOut className="w-4 h-4" /> Log Out
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}



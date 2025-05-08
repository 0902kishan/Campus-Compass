import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useId } from 'react';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

export function Navbar() {
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/search-items', label: 'Search Items' },
    { href: '/post-item', label: 'Post Found Item' },
  ];

  const mobileNavTitleId = useId();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Icons.Logo className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">Campus Compass</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-4">
          {navItems.map((item) => (
            <Button key={item.label} variant="ghost" asChild>
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" aria-labelledby={mobileNavTitleId}>
              <VisuallyHidden>
                <SheetTitle id={mobileNavTitleId}>Mobile Navigation Menu</SheetTitle>
              </VisuallyHidden>
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Button key={item.label} variant="ghost" asChild className="w-full justify-start text-lg py-3">
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getItemById, getClaimsByItemId } from '@/lib/mock-data';
import type { Item } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Tag, Mail, ShieldAlert, CheckCircle, Clock, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ContactItemOwnerForm } from './_components/ContactItemOwnerForm';
import { Separator } from '@/components/ui/separator';

import { getCurrentUser } from '@/lib/auth-actions';
import { Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

function getDefaultImageUrl(category: Item['category']): string {
  const categoryImageMap: Record<Item['category'], string> = {
    Electronics: 'https://picsum.photos/seed/electronics_default_large/800/600',
    Clothing: 'https://picsum.photos/seed/clothing_default_large/800/600',
    Books: 'https://picsum.photos/seed/books_default_large/800/600',
    Keys: 'https://picsum.photos/seed/keys_default_large/800/600',
    Wallet: 'https://picsum.photos/seed/wallet_default_large/800/600',
    Other: 'https://picsum.photos/seed/other_default_large/800/600',
  };
  return categoryImageMap[category] || categoryImageMap['Other'];
}

function getImageHint(category: Item['category']): string {
  const hints: Record<Item['category'], string> = {
    Electronics: "gadget tech",
    Clothing: "textile fashion",
    Books: "literature pages",
    Keys: "metal lock",
    Wallet: "finance cash",
    Other: "miscellaneous item",
  };
  return hints[category] || "miscellaneous item";
}

export default async function ItemPage({ params }: ItemPageProps) {
  const resolvedParams = await params;
  const [item, session] = await Promise.all([
    getItemById(resolvedParams.id),
    getCurrentUser(),
  ]);

  if (!item) {
    notFound();
  }

  const claims = await getClaimsByItemId(item.id);
  const displayImageUrl = item.imageUrl || getDefaultImageUrl(item.category);
  const status = item.status || 'available';

  // RULE CHECK: Is the current user the original poster?
  const isOwner = Boolean(
    session && (
      (item.userId && item.userId === session.id) || 
      (item.contactEmailToClaim.toLowerCase() === session.email.toLowerCase())
    )
  );

  // RULE CHECK: Has the current user already submitted a pending or approved claim?
  const existingUserClaim = session 
    ? claims.find(c => (c.claimantId === session.id || c.claimantEmail.toLowerCase() === session.email.toLowerCase()) && c.status !== 'rejected')
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Back button and navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
          <Link href="/search-items">
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="gap-2">
          <Link href="/dashboard">
            <LayoutDashboard className="w-4 h-4 text-primary" /> View in Dashboard
          </Link>
        </Button>
      </div>

      {/* Main Item Card - Completely Publicly Visible Without Login */}
      <Card className="shadow-xl overflow-hidden border-border/70">
        <div className="relative w-full h-72 md:h-96 bg-secondary">
          <Image
            src={displayImageUrl}
            alt={item.name}
            fill
            className="object-cover"
            priority
            data-ai-hint={getImageHint(item.category)}
            unoptimized={displayImageUrl.startsWith('data:')}
          />
          {/* Status banner on image */}
          <div className="absolute top-4 right-4">
            {status === 'available' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shadow-md backdrop-blur-md bg-background/90 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Available to Claim
              </span>
            )}
            {status === 'claimed' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shadow-md backdrop-blur-md bg-background/90 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                <Clock className="w-4 h-4 text-amber-500" />
                Claim in Progress
              </span>
            )}
            {status === 'returned' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shadow-md backdrop-blur-md bg-background/90 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                Reunited / Collected
              </span>
            )}
          </div>
        </div>

        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-extrabold text-foreground tracking-tight">{item.name}</CardTitle>
              {item.posterName && (
                <p className="text-xs text-muted-foreground mt-1">
                  Reported found by: <strong className="text-foreground">{item.posterName}</strong>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-2.5 py-1 font-mono">
                ID: {item.id}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center mt-3">
            <Badge variant="secondary" className="text-sm py-1 px-3 font-medium">
              <Tag className="w-3.5 h-3.5 mr-1.5 text-primary" />
              {item.category}
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Found at: {item.locationFound}
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">
              <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Found on: {format(new Date(item.dateFound), 'PPP')}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
            <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-line">{item.description}</p>
          </div>

          {/* Finder & Safe Connection Info */}
          <div className="rounded-xl bg-muted/50 p-4 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Announced by Finder</p>
                <p className="text-sm font-bold text-foreground">{item.contactEmailToClaim}</p>
              </div>
            </div>
            {session && (
              <Button size="sm" variant="outline" asChild>
                <a href={`mailto:${item.contactEmailToClaim}?subject=Inquiry about ${item.name} (ID: ${item.id})`}>
                  Contact Directly via Email
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Claim / Connect Section with strict authentication & authorization controls */}
      {status === 'returned' ? (
        <Card className="shadow-lg border-blue-500/30 bg-blue-500/5">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-2">
              <CheckCircle className="w-7 h-7" />
            </div>
            <CardTitle className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              Item Collected & Reunited!
            </CardTitle>
            <CardDescription className="text-base max-w-xl mx-auto pt-1">
              This item has been successfully verified, claimed, and returned to its rightful owner. New claims are closed for this listing.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-2 pb-6">
            <Button asChild variant="outline">
              <Link href="/dashboard">View in Completed Items Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : !session ? (
        /* Unauthenticated visitor prompt */
        <Card className="shadow-lg border-primary/30 bg-primary/5">
          <CardHeader className="text-center pb-3">
            <div className="w-14 h-14 rounded-full bg-primary/15 text-primary mx-auto flex items-center justify-center mb-2">
              <Lock className="w-7 h-7" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Sign In to Claim This Item</CardTitle>
            <CardDescription className="text-base max-w-lg mx-auto pt-1">
              Anyone can browse items publicly, but submitting an ownership claim requires signing in to prevent fake claims and verify identity.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-2 pb-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="font-semibold shadow-sm">
                <Link href={`/login?redirect=${encodeURIComponent(`/items/${item.id}`)}`}>
                  Sign In to Claim <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/signup?redirect=${encodeURIComponent(`/items/${item.id}`)}`}>
                  Create an Account
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You will be returned right back here after signing in.
            </p>
          </CardContent>
        </Card>
      ) : isOwner ? (
        /* Poster viewing their own item */
        <Card className="shadow-lg border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-foreground">You Posted This Item</CardTitle>
                <CardDescription>
                  You are registered as the finder/poster of this item. Original posters cannot claim their own items.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              When students submit claims with identifying proof for this item, you can review and verify their claims in the Dashboard.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <Button asChild className="font-semibold">
                <Link href="/dashboard">Open Dashboard to Manage Claims</Link>
              </Button>
              <Badge variant="outline" className="text-xs">
                {claims.length} {claims.length === 1 ? 'Claim Received' : 'Claims Received'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : existingUserClaim ? (
        /* User already claimed this item */
        <Card className="shadow-lg border-emerald-500/30 bg-emerald-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-foreground">Your Claim is Already Registered</CardTitle>
                <CardDescription>
                  Claim ID: <span className="font-mono font-bold text-foreground">{existingUserClaim.id}</span> • Status: <span className="uppercase font-bold text-emerald-700 dark:text-emerald-300">{existingUserClaim.status}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have already submitted an ownership claim for this item. The poster has received your details. Duplicate requests are prevented to protect the queue.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard?tab=claims">Track Claim in Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Authenticated eligible claimant form */
        <Card className="shadow-xl border-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-primary">Is This Your Item? Connect with Poster</CardTitle>
              {claims.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {claims.length} {claims.length === 1 ? 'Inquiry / Claim' : 'Inquiries / Claims'} submitted
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm leading-relaxed">
              Claiming as <strong className="text-foreground">{session.name}</strong> ({session.email}). Provide specific details only the true owner would know so the finder can verify your ownership.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'claimed' && (
              <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong className="text-amber-800 dark:text-amber-300">Note: Another claim is currently pending verification.</strong>
                  <p className="text-muted-foreground mt-0.5">
                    You can still submit your proof of ownership. The finder reviews all claims before handing over the item.
                  </p>
                </div>
              </div>
            )}
            <ContactItemOwnerForm 
              itemId={item.id} 
              itemOwnerEmail={item.contactEmailToClaim} 
              itemName={item.name}
              defaultClaimantName={session.name}
              defaultClaimantEmail={session.email}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

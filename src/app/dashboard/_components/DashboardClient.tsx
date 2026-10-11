'use client';

import { useState, useTransition } from 'react';
import type { Item, Claim, ItemStatus, ClaimStatus } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { updateClaimStatusAction, updateItemStatusAction, deleteItemAction, deleteClaimAction } from '@/lib/actions';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  CheckCheck, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Trash2, 
  ExternalLink, 
  Filter, 
  PlusCircle, 
  Search,
  Sparkles,
  UserCheck,
  XCircle,
  ShieldCheck,
  Inbox,
  Send,
  RotateCcw
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

interface DashboardClientProps {
  initialItems: Item[];
  initialClaims: Claim[];
  initialTab?: string;
}

export function DashboardClient({ initialItems, initialClaims, initialTab = 'announced' }: DashboardClientProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState<Item[]>(initialItems);
  const [claims, setClaims] = useState<Claim[]>(initialClaims);
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Filters
  const [userEmailFilter, setUserEmailFilter] = useState<string>('');
  const [announcedStatusFilter, setAnnouncedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [claimsStatusFilter, setClaimsStatusFilter] = useState<string>('all');
  const [onlyMyItems, setOnlyMyItems] = useState<boolean>(false);
  const [claimsViewFilter, setClaimsViewFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');

  // Stats calculation
  const totalAnnounced = items.length;
  const availableCount = items.filter(i => (i.status || 'available') === 'available').length;
  const claimedCount = items.filter(i => i.status === 'claimed').length;
  const returnedCount = items.filter(i => i.status === 'returned').length;
  const totalClaims = claims.length;
  const pendingClaims = claims.filter(c => c.status === 'pending').length;

  const myItemsCount = user ? items.filter(i => 
    (i.userId && i.userId === user.id) || 
    (i.contactEmailToClaim?.toLowerCase() === user.email.toLowerCase())
  ).length : 0;

  const incomingClaimsCount = user ? claims.filter(c => 
    (c.itemOwnerId && c.itemOwnerId === user.id) || 
    (c.itemOwnerEmail?.toLowerCase() === user.email.toLowerCase())
  ).length : 0;

  const outgoingClaimsCount = user ? claims.filter(c => 
    (c.claimantId === user.id) || 
    (c.claimantEmail?.toLowerCase() === user.email.toLowerCase())
  ).length : 0;

  const handleDeleteItem = (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to remove "${itemName}"? This action cannot be undone.`)) return;

    startTransition(async () => {
      setItems(prev => prev.filter(i => i.id !== itemId));
      const res = await deleteItemAction(itemId);
      if (res.success) {
        toast({ title: 'Item Removed', description: res.message });
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' });
        setItems(initialItems);
      }
    });
  };

  // Automated or Authorized Owner manual status update
  const handleUpdateItemStatus = (itemId: string, newStatus: ItemStatus) => {
    startTransition(async () => {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: newStatus } : i));
      const res = await updateItemStatusAction(itemId, newStatus);
      if (res.success) {
        toast({ title: 'Status Updated', description: res.message });
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' });
        setItems(initialItems);
      }
    });
  };

  // Handlers for Claims
  const handleUpdateClaimStatus = (claimId: string, newStatus: ClaimStatus, itemId: string) => {
    startTransition(async () => {
      setClaims(prev => prev.map(c => {
        if (c.id === claimId) return { ...c, status: newStatus };
        // If approving, other pending claims for this item are rejected
        if (newStatus === 'approved' && c.itemId === itemId && c.status === 'pending') {
          return { ...c, status: 'rejected' };
        }
        return c;
      }));

      if (newStatus === 'approved') {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'returned' } : i));
      } else if (newStatus === 'rejected') {
        // If no other pending, revert to available
        const otherPending = claims.some(c => c.itemId === itemId && c.id !== claimId && c.status === 'pending');
        if (!otherPending) {
          setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'available' } : i));
        }
      }

      const res = await updateClaimStatusAction(claimId, newStatus);
      if (res.success) {
        toast({ title: 'Claim Status Updated', description: res.message });
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' });
        setClaims(initialItemsClaims => initialItemsClaims);
      }
    });
  };

  const handleDeleteClaim = (claimId: string) => {
    if (!confirm('Are you sure you want to cancel / remove this claim record?')) return;

    startTransition(async () => {
      setClaims(prev => prev.filter(c => c.id !== claimId));
      const res = await deleteClaimAction(claimId);
      if (res.success) {
        toast({ title: 'Claim Removed', description: res.message });
      } else {
        toast({ title: 'Error', description: res.message, variant: 'destructive' });
        setClaims(initialClaims);
      }
    });
  };

  // Filtered items logic
  const filteredAnnouncedItems = items.filter(item => {
    const itemStatus = item.status || 'available';
    if (announcedStatusFilter !== 'all' && itemStatus !== announcedStatusFilter) return false;
    
    // "My items" toggle
    if (onlyMyItems && user) {
      const isOwner = (item.userId && item.userId === user.id) || 
                      (item.contactEmailToClaim?.toLowerCase() === user.email.toLowerCase());
      if (!isOwner) return false;
    }

    if (userEmailFilter) {
      const matchFinder = item.contactEmailToClaim?.toLowerCase().includes(userEmailFilter.toLowerCase().trim());
      if (!matchFinder) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchLoc = item.locationFound.toLowerCase().includes(q);
      return matchName || matchDesc || matchCat || matchLoc;
    }
    return true;
  });

  // Filtered collected items logic
  const collectedItems = items.filter(item => (item.status === 'returned'));

  // Filtered claims logic
  const filteredClaims = claims.filter(claim => {
    if (claimsStatusFilter !== 'all' && claim.status !== claimsStatusFilter) return false;

    // View type: incoming (claims on user's posted items) vs outgoing (user's claims on other items)
    if (user && claimsViewFilter === 'incoming') {
      const isFinder = (claim.itemOwnerId && claim.itemOwnerId === user.id) ||
                       (claim.itemOwnerEmail?.toLowerCase() === user.email.toLowerCase());
      if (!isFinder) return false;
    }
    if (user && claimsViewFilter === 'outgoing') {
      const isClaimant = (claim.claimantId === user.id) ||
                         (claim.claimantEmail?.toLowerCase() === user.email.toLowerCase());
      if (!isClaimant) return false;
    }

    if (userEmailFilter) {
      const q = userEmailFilter.toLowerCase().trim();
      const matchClaimant = claim.claimantEmail?.toLowerCase().includes(q);
      const matchOwner = claim.itemOwnerEmail?.toLowerCase().includes(q);
      if (!matchClaimant && !matchOwner) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchItem = claim.itemName?.toLowerCase().includes(q);
      const matchName = claim.claimantName?.toLowerCase().includes(q);
      const matchMsg = claim.message?.toLowerCase().includes(q);
      return matchItem || matchName || matchMsg;
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
            <span>Campus Compass Hub</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
              Live Verified Storage
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Central dashboard for all announced items, collected belongings, and user-finder connection claims.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="gap-2 font-semibold shadow-sm">
            <Link href="/post-item">
              <PlusCircle className="w-4 h-4" /> Announce Found Item
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/search-items">
              <Search className="w-4 h-4" /> Search Directory
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/70 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Announced Items</p>
              <h3 className="text-2xl font-black text-foreground mt-0.5">{totalAnnounced}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{availableCount} currently active</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available to Claim</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{availableCount}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Waiting for owners</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CheckCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reunited & Collected</p>
              <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{returnedCount}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Successfully returned</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm hover:shadow transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Inquiries / Claims</p>
              <h3 className="text-2xl font-black text-foreground mt-0.5">{totalClaims}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{pendingClaims} pending review</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Filter Bar: User Email Filter & Search */}
      <Card className="bg-card border-border/80 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search items by name, category, or claim message..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="relative w-full sm:w-80">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Filter by email (finder/claimant)..."
                value={userEmailFilter}
                onChange={e => setUserEmailFilter(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            {(searchQuery || userEmailFilter || onlyMyItems || claimsViewFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { 
                  setSearchQuery(''); 
                  setUserEmailFilter(''); 
                  setOnlyMyItems(false);
                  setClaimsViewFilter('all');
                }}
                className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
              >
                Reset Filters
              </Button>
            )}
          </div>
          {userEmailFilter && (
            <div className="mt-2.5 text-xs text-muted-foreground flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-primary" />
              <span>Showing records connected with: <strong className="text-foreground">{userEmailFilter}</strong></span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md h-11 p-1 bg-muted/80">
          <TabsTrigger value="announced" className="text-xs sm:text-sm font-semibold gap-1.5 data-[state=active]:bg-background">
            <Package className="w-4 h-4" />
            <span>Announced ({items.length})</span>
          </TabsTrigger>
          <TabsTrigger value="collected" className="text-xs sm:text-sm font-semibold gap-1.5 data-[state=active]:bg-background">
            <CheckCheck className="w-4 h-4" />
            <span>Collected ({collectedItems.length})</span>
          </TabsTrigger>
          <TabsTrigger value="claims" className="text-xs sm:text-sm font-semibold gap-1.5 data-[state=active]:bg-background">
            <MessageSquare className="w-4 h-4" />
            <span>Claims Hub ({claims.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ANNOUNCED ITEMS */}
        <TabsContent value="announced" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">
                Showing <strong className="text-foreground">{filteredAnnouncedItems.length}</strong> items
              </span>
              {user && (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant={onlyMyItems ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOnlyMyItems(!onlyMyItems)}
                    className="h-7 text-xs gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    {onlyMyItems ? 'Showing My Uploads' : `My Uploads (${myItemsCount})`}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Filter Status:</span>
              <Select value={announcedStatusFilter} onValueChange={setAnnouncedStatusFilter}>
                <SelectTrigger className="w-44 h-8 text-xs bg-background">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">🟢 Available</SelectItem>
                  <SelectItem value="claimed">🟡 Claim in Progress</SelectItem>
                  <SelectItem value="returned">🔵 Reunited / Collected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredAnnouncedItems.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 border rounded-2xl p-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-bold">No Announced Items Found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                {onlyMyItems 
                  ? "You haven't uploaded any found items yet. Post a found item to help reunite it with its owner!"
                  : "No items match your selected filters. Try clearing filters or announce a new found item."}
              </p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/post-item">Announce Found Item</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnnouncedItems.map((item) => {
                const itemStatus = item.status || 'available';
                const itemClaims = claims.filter(c => c.itemId === item.id);
                const isOwner = Boolean(user && (
                  (item.userId && item.userId === user.id) ||
                  (item.contactEmailToClaim?.toLowerCase() === user.email.toLowerCase())
                ));

                return (
                  <Card key={item.id} className="flex flex-col border-border/70 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                    <div className="relative w-full h-44 bg-muted overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized={item.imageUrl.startsWith('data:')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/50 text-muted-foreground">
                          <Package className="w-10 h-10" />
                        </div>
                      )}
                      
                      {/* Live Automated Status Tag */}
                      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md bg-background/90 border ${
                          itemStatus === 'available' ? 'border-emerald-500/30 text-emerald-700 dark:text-emerald-300' :
                          itemStatus === 'claimed' ? 'border-amber-500/30 text-amber-700 dark:text-amber-300' :
                          'border-blue-500/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            itemStatus === 'available' ? 'bg-emerald-500' :
                            itemStatus === 'claimed' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'
                          }`} />
                          {itemStatus === 'available' ? 'Available' : itemStatus === 'claimed' ? 'Claim in Progress' : 'Reunited'}
                        </span>
                        {isOwner && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/90 text-primary-foreground shadow-sm">
                            <Sparkles className="w-2.5 h-2.5" /> Your Post
                          </span>
                        )}
                      </div>
                    </div>

                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg font-bold line-clamp-1">{item.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs shrink-0">{item.category}</Badge>
                      </div>
                      <CardDescription className="text-xs flex items-center gap-1 text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{item.locationFound}</span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 pt-1 flex-grow space-y-3">
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                      
                      <div className="text-xs bg-muted/50 p-2.5 rounded-lg border border-border/50 space-y-1">
                        <p className="text-muted-foreground flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 shrink-0 text-primary" />
                          <span>Finder: <strong className="text-foreground">{item.posterName || item.contactEmailToClaim}</strong></span>
                        </p>
                        <p className="text-muted-foreground">
                          Date: <strong className="text-foreground">{format(new Date(item.dateFound), 'MMM d, yyyy')}</strong>
                        </p>
                        {itemClaims.length > 0 && (
                          <p className="text-amber-600 dark:text-amber-400 font-semibold pt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {itemClaims.length} {itemClaims.length === 1 ? 'ownership claim' : 'ownership claims'} received
                          </p>
                        )}
                      </div>

                      {/* Automated Status Lifecycle Banner (No random manual toggle) */}
                      <div className="pt-2 border-t border-border/50">
                        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                              Status Lifecycle:
                            </span>
                            <span className={`inline-flex items-center gap-1 font-bold ${
                              itemStatus === 'available' ? 'text-emerald-600 dark:text-emerald-400' :
                              itemStatus === 'claimed' ? 'text-amber-600 dark:text-amber-400' :
                              'text-blue-600 dark:text-blue-400'
                            }`}>
                              {itemStatus === 'available' ? '🟢 Open to Claim' : itemStatus === 'claimed' ? '🟡 Verification Underway' : '🔵 Closed & Reunited'}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug">
                            {itemStatus === 'available' && "Automatically switches to 'Claim in Progress' when someone submits ownership proof."}
                            {itemStatus === 'claimed' && `${itemClaims.length} claim(s) received. Automatically marks 'Reunited' once verified & approved by finder.`}
                            {itemStatus === 'returned' && "Claim verified and handed over to owner. Reunited successfully."}
                          </p>
                        </div>
                      </div>

                      {/* Poster Exclusive Controls */}
                      {isOwner && (
                        <div className="pt-1.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Finder Actions
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {itemClaims.length > 0 && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => { setActiveTab('claims'); setClaimsViewFilter('incoming'); }}
                                className="h-7 text-xs flex-1 font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                              >
                                Review {itemClaims.length} Claim(s)
                              </Button>
                            )}
                            {itemStatus !== 'returned' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateItemStatus(item.id, 'returned')}
                                disabled={isPending}
                                className="h-7 text-xs flex-1 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 border-blue-500/30"
                              >
                                Mark Reunited
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateItemStatus(item.id, 'available')}
                                disabled={isPending}
                                className="h-7 text-xs flex-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30"
                              >
                                Re-open Listing
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <div className="p-4 pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                      <Button asChild size="sm" variant={isOwner ? "outline" : "default"} className="text-xs h-8 flex-1">
                        <Link href={`/items/${item.id}`}>
                          {isOwner ? 'View Public Page' : itemStatus === 'available' ? 'View & Claim Item' : 'View Item Details'}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="h-8 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title="Delete your listing"
                          disabled={isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: COLLECTED & REUNITED SECTION */}
        <TabsContent value="collected" className="space-y-6">
          <div className="bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-transparent p-6 rounded-2xl border border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Reunited & Collected Belongings</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Items that have been claimed and successfully handed back to their owners.
                </p>
              </div>
            </div>
          </div>

          {collectedItems.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 border rounded-2xl p-8">
              <CheckCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-bold">No Items Collected Yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Once a claim is approved by a poster, the item is automatically marked as reunited/collected and displayed here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collectedItems.map((item) => (
                <Card key={item.id} className="border-blue-500/30 bg-blue-500/5 shadow-sm overflow-hidden flex flex-col">
                  <div className="relative w-full h-40 bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized={item.imageUrl.startsWith('data:')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/50 text-muted-foreground">
                        <Package className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-background/90 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                        Reunited!
                      </span>
                    </div>
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
                    <CardDescription className="text-xs">Category: {item.category}</CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 pt-1 flex-grow text-xs text-muted-foreground space-y-2">
                    <p className="line-clamp-2">{item.description}</p>
                    <div className="p-2.5 bg-background/80 rounded-lg border text-xs space-y-1">
                      <p>Found at: <strong className="text-foreground">{item.locationFound}</strong></p>
                      <p>Handled by: <strong className="text-foreground">{item.contactEmailToClaim}</strong></p>
                    </div>
                  </CardContent>

                  <div className="p-4 pt-2 border-t border-blue-500/20">
                    <Button asChild size="sm" variant="secondary" className="w-full text-xs">
                      <Link href={`/items/${item.id}`}>View Item Record</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: CLAIMS & CONNECT HUB (POSTER & USER INTERACTION) */}
        <TabsContent value="claims" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/50">
            <div>
              <h3 className="text-sm font-bold text-foreground">Claims & Inquiries Hub</h3>
              <p className="text-xs text-muted-foreground">Review ownership proof, connect directly, and verify reunions.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {user && (
                <div className="flex items-center gap-1 bg-background p-0.5 rounded-lg border text-xs">
                  <Button
                    variant={claimsViewFilter === 'all' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setClaimsViewFilter('all')}
                    className="h-7 text-xs px-2.5"
                  >
                    All ({claims.length})
                  </Button>
                  <Button
                    variant={claimsViewFilter === 'incoming' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setClaimsViewFilter('incoming')}
                    className="h-7 text-xs px-2.5 gap-1"
                  >
                    <Inbox className="w-3 h-3 text-primary" /> Incoming to Review ({incomingClaimsCount})
                  </Button>
                  <Button
                    variant={claimsViewFilter === 'outgoing' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setClaimsViewFilter('outgoing')}
                    className="h-7 text-xs px-2.5 gap-1"
                  >
                    <Send className="w-3 h-3 text-primary" /> My Claims ({outgoingClaimsCount})
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Select value={claimsStatusFilter} onValueChange={setClaimsStatusFilter}>
                  <SelectTrigger className="w-36 h-8 text-xs bg-background">
                    <SelectValue placeholder="All Claims" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">🟡 Pending</SelectItem>
                    <SelectItem value="approved">🟢 Approved</SelectItem>
                    <SelectItem value="rejected">🔴 Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {filteredClaims.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 border rounded-2xl p-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-bold">No Claims or Inquiries Found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                {claimsViewFilter === 'incoming'
                  ? "No one has submitted a claim for items you announced yet."
                  : claimsViewFilter === 'outgoing'
                  ? "You haven't submitted any ownership claims yet. Browse search items to claim lost belongings."
                  : "When a user visits a found item and submits their proof of ownership, the inquiry will appear here for verification."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClaims.map((claim) => {
                const isPendingReview = claim.status === 'pending';
                const isApproved = claim.status === 'approved';
                const isRejected = claim.status === 'rejected';

                const isFinder = Boolean(user && (
                  (claim.itemOwnerId && user.id === claim.itemOwnerId) ||
                  (claim.itemOwnerEmail?.toLowerCase() === user.email.toLowerCase())
                ));

                const isClaimant = Boolean(user && (
                  (claim.claimantId === user.id) ||
                  (claim.claimantEmail?.toLowerCase() === user.email.toLowerCase())
                ));

                return (
                  <Card key={claim.id} className="border-border/80 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-5 pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                              {claim.id}
                            </span>
                            <CardTitle className="text-lg font-bold text-foreground">
                              Claim for: <Link href={`/items/${claim.itemId}`} className="text-primary hover:underline">{claim.itemName}</Link>
                            </CardTitle>
                            {isFinder && (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                                You Found This
                              </Badge>
                            )}
                            {isClaimant && (
                              <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 text-[10px]">
                                Your Claim
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted on {format(new Date(claim.createdAt), 'PPP p')}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {isPendingReview && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1.5 py-1 px-3">
                              <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Verification
                            </Badge>
                          )}
                          {isApproved && (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1.5 py-1 px-3">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Approved & Handed Over
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1.5 py-1 px-3">
                              <XCircle className="w-3.5 h-3.5 text-destructive" /> Rejected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 pt-0 space-y-4">
                      {/* Connection details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-muted/40 p-3 rounded-xl border border-border/50">
                        <div>
                          <span className="text-muted-foreground font-medium">Claimant (User Claiming):</span>
                          <p className="text-sm font-bold text-foreground mt-0.5">{claim.claimantName}</p>
                          <p className="text-muted-foreground font-mono">{claim.claimantEmail}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">Item Finder (Poster):</span>
                          <p className="text-sm font-bold text-foreground mt-0.5">{claim.itemOwnerEmail}</p>
                          <p className="text-muted-foreground">Direct verification authority</p>
                        </div>
                      </div>

                      {/* Message / Proof */}
                      <div className="p-4 rounded-xl bg-background border border-border/70 space-y-1.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Proof of Ownership / Claimant's Note:
                        </span>
                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                          "{claim.message}"
                        </p>
                      </div>

                      {/* Claimant feedback if current user is the claimant */}
                      {isClaimant && (
                        <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs">
                          {isPendingReview && (
                            <p className="text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              Your claim is in the finder's queue. They will check your details and contact you via email.
                            </p>
                          )}
                          {isApproved && (
                            <p className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              The finder has approved your ownership claim! Contact them to collect your item.
                            </p>
                          )}
                          {isRejected && (
                            <p className="text-destructive flex items-center gap-1.5">
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              The finder declined this claim request.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions Toolbar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Direct Email Connect Button */}
                          <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                            <a 
                              href={isFinder 
                                ? `mailto:${claim.claimantEmail}?subject=Regarding your claim for ${encodeURIComponent(claim.itemName)}&body=Hi ${encodeURIComponent(claim.claimantName)},%0D%0A%0D%0ARegarding your claim for ${encodeURIComponent(claim.itemName)} on Campus Compass...`
                                : `mailto:${claim.itemOwnerEmail}?subject=Regarding my claim for ${encodeURIComponent(claim.itemName)}&body=Hi,%0D%0A%0D%0AFollowing up on my claim (ID: ${claim.id}) for ${encodeURIComponent(claim.itemName)}...`
                              }
                            >
                              <Mail className="w-3.5 h-3.5 text-primary" /> 
                              {isFinder ? 'Email Claimant Directly' : 'Email Finder Directly'}
                            </a>
                          </Button>

                          {/* Quick Link to Item */}
                          <Button asChild size="sm" variant="ghost" className="gap-1 text-xs h-8">
                            <Link href={`/items/${claim.itemId}`}>
                              View Item <ExternalLink className="w-3 h-3" />
                            </Link>
                          </Button>
                        </div>

                        {/* Approval / Rejection Controls - Only authorized item poster can approve */}
                        <div className="flex items-center gap-2">
                          {(() => {
                            if (!user) {
                              return (
                                <Button asChild size="sm" variant="outline" className="text-xs h-8">
                                  <Link href={`/login?redirect=${encodeURIComponent('/dashboard?tab=claims')}`}>
                                    Log In as Poster to Review
                                  </Link>
                                </Button>
                              );
                            }

                            if (!isFinder) {
                              return (
                                <Badge variant="secondary" className="text-[11px] py-1 text-muted-foreground font-normal">
                                  {isClaimant ? 'Submitted by you' : `Review restricted to finder (${claim.itemOwnerEmail})`}
                                </Badge>
                              );
                            }

                            // User IS the finder
                            return (
                              <>
                                {isPendingReview && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateClaimStatus(claim.id, 'approved', claim.itemId)}
                                      disabled={isPending}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 font-semibold shadow-sm"
                                    >
                                      <UserCheck className="w-3.5 h-3.5" /> Approve & Mark Returned
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateClaimStatus(claim.id, 'rejected', claim.itemId)}
                                      disabled={isPending}
                                      className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs h-8"
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {!isPendingReview && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateClaimStatus(claim.id, 'pending', claim.itemId)}
                                    disabled={isPending}
                                    className="text-xs h-8 gap-1"
                                  >
                                    <RotateCcw className="w-3 h-3" /> Re-open as Pending
                                  </Button>
                                )}
                              </>
                            );
                          })()}

                          {(isFinder || isClaimant) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClaim(claim.id)}
                              disabled={isPending}
                              className="text-destructive hover:bg-destructive/10 h-8 px-2"
                              title={isFinder ? "Delete claim record" : "Cancel your claim"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

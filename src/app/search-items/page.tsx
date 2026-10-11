import { Suspense } from 'react';
import { ItemCard } from '@/components/ItemCard';
import type { Item } from '@/types';
import { getItems } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SearchResults } from './_components/SearchResults';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Search Lost & Found Items | Campus Compass',
  description: 'Browse and search for items reported found on campus.',
};

function SearchItemsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

const categories = ["All", "Electronics", "Clothing", "Books", "Keys", "Wallet", "Other"];
const statusFilters = [
  { value: 'all', label: 'All Items' },
  { value: 'available', label: 'Available to Claim' },
  { value: 'claimed', label: 'Claim in Progress' },
  { value: 'returned', label: 'Reunited / Collected' },
];

export default async function SearchItemsPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; category?: string; status?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const query = resolvedParams.query || '';
  const currentCategory = resolvedParams.category || 'all';
  const currentStatus = resolvedParams.status || 'all';

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">Find Lost & Found Items</h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Search items reported across campus, filter by availability, or claim your lost belongings with safe finder connection.
        </p>
      </div>

      {/* Search and Filter Form */}
      <div className="max-w-3xl mx-auto space-y-4 bg-card p-6 rounded-2xl shadow-sm border border-border/70">
        <form method="GET" className="flex flex-col sm:flex-row gap-2.5">
          <Input
            type="search"
            name="query"
            placeholder="Search by title, description, category, or location..."
            className="flex-1"
            defaultValue={query}
          />
          {currentCategory !== 'all' && <input type="hidden" name="category" value={currentCategory} />}
          {currentStatus !== 'all' && <input type="hidden" name="status" value={currentStatus} />}
          <Button type="submit" variant="default" className="shrink-0 px-6 font-semibold">
            Search Items
          </Button>
          {(query || currentCategory !== 'all' || currentStatus !== 'all') && (
            <Button variant="ghost" asChild className="shrink-0 text-muted-foreground hover:text-foreground">
              <Link href="/search-items">Clear Filters</Link>
            </Button>
          )}
        </form>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">Status:</span>
          {statusFilters.map((s) => {
            const isActive = currentStatus === s.value;
            // Build query URL
            const params = new URLSearchParams();
            if (query) params.set('query', query);
            if (currentCategory && currentCategory !== 'all') params.set('category', currentCategory);
            if (s.value !== 'all') params.set('status', s.value);
            const href = `/search-items${params.toString() ? `?${params.toString()}` : ''}`;

            return (
              <Button
                key={s.value}
                size="sm"
                variant={isActive ? 'default' : 'outline'}
                className={`text-xs h-8 rounded-full ${isActive ? 'font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                asChild
              >
                <Link href={href}>{s.label}</Link>
              </Button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">Category:</span>
          {categories.map((c) => {
            const val = c.toLowerCase();
            const isActive = currentCategory.toLowerCase() === val || (c === 'All' && currentCategory === 'all');
            const params = new URLSearchParams();
            if (query) params.set('query', query);
            if (c !== 'All') params.set('category', c);
            if (currentStatus && currentStatus !== 'all') params.set('status', currentStatus);
            const href = `/search-items${params.toString() ? `?${params.toString()}` : ''}`;

            return (
              <Button
                key={c}
                size="sm"
                variant={isActive ? 'secondary' : 'ghost'}
                className={`text-xs h-7 px-2.5 rounded-md ${isActive ? 'font-bold bg-secondary text-primary' : 'text-muted-foreground'}`}
                asChild
              >
                <Link href={href}>{c}</Link>
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Results Component */}
      <Suspense fallback={<SearchItemsSkeleton />}>
        <SearchResults query={query} category={currentCategory} status={currentStatus} />
      </Suspense>

      <div className="text-center mt-12 bg-muted/30 p-6 rounded-2xl border border-border/50 max-w-xl mx-auto">
        <p className="text-sm font-medium text-foreground mb-1">Found an item on campus?</p>
        <p className="text-xs text-muted-foreground mb-4">
          Report it in under 60 seconds so the rightful owner can find and claim it.
        </p>
        <Button asChild className="font-semibold shadow-sm">
          <Link href="/post-item">Announce Found Item</Link>
        </Button>
      </div>
    </div>
  );
}

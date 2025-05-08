import { Suspense } from 'react';
import { ItemCard } from '@/components/ItemCard';
import type { Item } from '@/types';
import { getItems } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SearchResults } from './_components/SearchResults';
import { Skeleton } from '@/components/ui/skeleton';

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

export default async function SearchItemsPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || '';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Find Your Lost Item</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Browse through items found on campus or use the search bar to find something specific.
        </p>
      </div>

      <form className="flex w-full max-w-xl mx-auto items-center space-x-2">
        <Input
          type="search"
          name="query"
          placeholder="Search by name, description, or category..."
          className="flex-1"
          defaultValue={query}
        />
        <Button type="submit" variant="default">Search</Button>
      </form>
      
      <Suspense fallback={<SearchItemsSkeleton />}>
        <SearchResults query={query} />
      </Suspense>

      <div className="text-center mt-12">
        <p className="text-muted-foreground mb-2">Can't find what you're looking for?</p>
        <p className="text-muted-foreground">
          If you've found an item, please {' '}
          <Button variant="link" asChild className="p-0 h-auto text-accent hover:underline">
            <Link href="/post-item">post it here</Link>
          </Button>
          {' '} to help it find its way back.
        </p>
      </div>
    </div>
  );
}

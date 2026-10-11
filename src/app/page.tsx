import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PackageSearch, Search, Edit3 } from "lucide-react";
import { ItemCard } from "@/components/ItemCard";
import { getItems } from "@/lib/mock-data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import { LayoutDashboard, Users } from "lucide-react";

export const dynamic = 'force-dynamic';

async function RecentItems() {
  const recentItems = (await getItems()).slice(0, 3);

  if (recentItems.length === 0) {
    return <p className="text-muted-foreground text-center">No items posted yet. Be the first!</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recentItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function RecentItemsSkeleton() {
 return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-16 pb-12">
      <section className="text-center py-12 md:py-20">
        <PackageSearch className="mx-auto h-16 w-16 text-primary mb-6 animate-bounce" />
        <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Welcome to Campus Compass
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Your central hub for finding lost items, reporting found ones, and safely connecting claimants with finders on campus.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md">
            <Link href="/post-item">
              <Edit3 className="mr-2 h-5 w-5" /> Post a Found Item
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-semibold">
            <Link href="/search-items">
              <Search className="mr-2 h-5 w-5" /> Search for Lost Item
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="font-semibold">
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-5 w-5 text-primary" /> Open Dashboard
            </Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-2 text-primary">How It Works</h2>
        <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
          A seamless 3-step process to connect lost items with their rightful owners.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between">
            <CardHeader>
              <Edit3 className="mx-auto h-10 w-10 text-accent mb-3" />
              <CardTitle>1. Post Found Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm leading-relaxed">
                Found an item on campus? Describe it, optionally add a photo, and announce it so the owner can recognize it.
              </CardDescription>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/post-item">Announce an Item</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between">
            <CardHeader>
              <Search className="mx-auto h-10 w-10 text-accent mb-3" />
              <CardTitle>2. Search & Browse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm leading-relaxed">
                Lost something? Search by keyword or filter by category and availability status to spot your item.
              </CardDescription>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/search-items">Search Directory</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between border-primary/30">
            <CardHeader>
              <Users className="mx-auto h-10 w-10 text-accent mb-3" />
              <CardTitle>3. Connect & Claim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm leading-relaxed">
                Submit an ownership claim with identifying proof. The poster reviews it and connects directly via email to return it.
              </CardDescription>
              <Button asChild variant="default" size="sm" className="w-full font-semibold">
                <Link href="/dashboard?tab=claims">Connect Hub & Claims</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-primary">Recently Found Items</h2>
            <p className="text-sm text-muted-foreground">Latest reports submitted to Campus Compass</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/search-items">View All Items</Link>
          </Button>
        </div>
        <Suspense fallback={<RecentItemsSkeleton />}>
          <RecentItems />
        </Suspense>
      </section>
    </div>
  );
}

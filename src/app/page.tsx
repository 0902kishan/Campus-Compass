import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { PackageSearch, Search, Edit3 } from "lucide-react";
import { ItemCard } from "@/components/ItemCard";
import { getItems } from "@/lib/mock-data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="space-y-16">
      <section className="text-center py-12 md:py-20">
        <PackageSearch className="mx-auto h-16 w-16 text-primary mb-6" />
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Welcome to Campus Compass
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
          Your central hub for finding lost items and reporting found ones on campus. Let's help each other keep our belongings safe!
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/post-item">
              <Edit3 className="mr-2 h-5 w-5" /> Post a Found Item
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/search-items">
              <Search className="mr-2 h-5 w-5" /> Search for Lost Item
            </Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-2 text-primary">How It Works</h2>
        <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
          A simple process to connect lost items with their rightful owners.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center shadow-lg">
            <CardHeader>
              <Edit3 className="mx-auto h-10 w-10 text-accent mb-3" />
              <CardTitle>1. Post Found Item</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                If you've found an item, describe it, add an image (optional), and post it. Your details help owners identify their belongings.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg">
            <CardHeader>
              <Search className="mx-auto h-10 w-10 text-accent mb-3" />
              <CardTitle>2. Search & Browse</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Lost something? Browse through the listed items or use the search to find it by keywords or category.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg">
            <CardHeader>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-10 w-10 text-accent mb-3 lucide lucide-users-round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="4"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-10 0c-2 1.5-4 4.63-4 8"/></svg>
              <CardTitle>3. Connect & Claim</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Found your item? Use the secure contact form to message the poster and arrange for its return.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-center mb-10 text-primary">Recently Found Items</h2>
        <Suspense fallback={<RecentItemsSkeleton />}>
          <RecentItems />
        </Suspense>
        <div className="text-center mt-10">
          <Button asChild variant="default">
            <Link href="/search-items">View All Items</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

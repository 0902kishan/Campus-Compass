import Image from 'next/image';
import Link from 'next/link';
import type { Item } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, CalendarDays, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ItemCardProps {
  item: Item;
}

function getDefaultImageUrl(category: Item['category']): string {
  const categoryImageMap: Record<Item['category'], string> = {
    Electronics: 'https://picsum.photos/seed/electronics_default/400/300',
    Clothing: 'https://picsum.photos/seed/clothing_default/400/300',
    Books: 'https://picsum.photos/seed/books_default/400/300',
    Keys: 'https://picsum.photos/seed/keys_default/400/300',
    Wallet: 'https://picsum.photos/seed/wallet_default/400/300',
    Other: 'https://picsum.photos/seed/other_default/400/300',
  };
  return categoryImageMap[category] || categoryImageMap['Other'];
}

function getImageHint(category: Item['category']): string {
  const hints: Record<Item['category'], string> = {
    Electronics: "gadget device",
    Clothing: "fabric garment",
    Books: "textbook novel",
    Keys: "keychain lock",
    Wallet: "money cards",
    Other: "object item",
  };
  return hints[category] || "object item";
}


export function ItemCard({ item }: ItemCardProps) {
  const displayImageUrl = item.imageUrl || getDefaultImageUrl(item.category);
  const status = item.status || 'available';

  const statusConfig = {
    available: {
      label: 'Available',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      dotClass: 'bg-emerald-500',
    },
    claimed: {
      label: 'Claim in Progress',
      badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      dotClass: 'bg-amber-500',
    },
    returned: {
      label: 'Reunited / Collected',
      badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
      dotClass: 'bg-blue-500',
    },
  }[status] || {
    label: 'Available',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    dotClass: 'bg-emerald-500',
  };

  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-xl transition-all duration-300 border-border/60 hover:border-primary/40 group overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative w-full h-48 overflow-hidden bg-muted">
          <Image
            src={displayImageUrl}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            data-ai-hint={getImageHint(item.category)}
            unoptimized={displayImageUrl.startsWith('data:')}
          />
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md bg-background/85 border ${statusConfig.badgeClass}`}>
              <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
              {statusConfig.label}
            </span>
          </div>
        </div>
        <div className="p-5 pb-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <CardTitle className="text-xl font-bold tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
              {item.name}
            </CardTitle>
          </div>
          <CardDescription className="flex items-center text-xs text-muted-foreground">
            <Tag className="w-3.5 h-3.5 mr-1 text-primary" />
            <Badge variant="secondary" className="font-medium text-xs">{item.category}</Badge>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-5 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {item.description}
        </p>
        <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
          <p className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-2 text-primary shrink-0" />
            <span className="truncate">Found at: <strong className="text-foreground font-medium">{item.locationFound}</strong></span>
          </p>
          <p className="flex items-center">
            <CalendarDays className="w-3.5 h-3.5 mr-2 text-primary shrink-0" />
            <span>Found on: <strong className="text-foreground font-medium">{format(new Date(item.dateFound), 'MMM d, yyyy')}</strong></span>
          </p>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-2">
        <Button asChild className="w-full font-medium shadow-sm transition-all" variant={status === 'returned' ? 'secondary' : 'default'}>
          <Link href={`/items/${item.id}`}>
            {status === 'available' ? 'View & Claim Item' : status === 'claimed' ? 'View Details (Claimed)' : 'View Details (Reunited)'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

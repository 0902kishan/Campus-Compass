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

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="relative w-full h-48 mb-4 rounded-t-lg overflow-hidden">
          <Image
            src={displayImageUrl}
            alt={item.name}
            fill
            style={{objectFit:"cover"}}
            data-ai-hint={getImageHint(item.category)}
          />
        </div>
        <CardTitle className="text-xl">{item.name}</CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground">
          <Tag className="w-4 h-4 mr-1" />
          <Badge variant="secondary">{item.category}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{item.description}</p>
        <div className="space-y-1 text-sm">
          <p className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            Found at: {item.locationFound}
          </p>
          <p className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-2 text-primary" />
            Found on: {format(new Date(item.dateFound), 'PPP')}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-primary hover:bg-primary/90">
          <Link href={`/items/${item.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

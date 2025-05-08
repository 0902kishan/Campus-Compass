import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getItemById } from '@/lib/mock-data';
import type { Item } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ContactItemOwnerForm } from './_components/ContactItemOwnerForm';
import { Separator } from '@/components/ui/separator';

export const revalidate = 3600; // Revalidate every hour, or adjust as needed

export async function generateStaticParams() {
  // In a real app, you'd fetch all item IDs here
  // For mock data, we can simulate if needed, or just rely on dynamic rendering.
  // const items = await getItems();
  // return items.map((item) => ({ id: item.id }));
  return []; // Keep it dynamic for mock data for simplicity
}

interface ItemPageProps {
  params: { id: string };
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
  const item = await getItemById(params.id);

  if (!item) {
    notFound();
  }

  const displayImageUrl = item.imageUrl || getDefaultImageUrl(item.category);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="shadow-xl overflow-hidden">
        <div className="relative w-full h-64 md:h-96 bg-secondary">
          <Image
            src={displayImageUrl}
            alt={item.name}
            fill
            style={{objectFit:"cover"}}
            priority // Prioritize loading image for LCP
            data-ai-hint={getImageHint(item.category)}
          />
        </div>
        <CardHeader className="pb-4">
          <CardTitle className="text-3xl font-bold text-primary">{item.name}</CardTitle>
          <div className="flex flex-wrap gap-2 items-center mt-2">
            <Badge variant="secondary" className="text-sm py-1 px-3">
              <Tag className="w-4 h-4 mr-2" />
              {item.category}
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">
              <MapPin className="w-4 h-4 mr-2" />
              Found at: {item.locationFound}
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">
              <CalendarDays className="w-4 h-4 mr-2" />
              Found on: {format(new Date(item.dateFound), 'PPP')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed text-foreground/90">{item.description}</p>
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-accent">Is This Your Item?</CardTitle>
          <CardDescription>
            If you believe this item belongs to you, please fill out the form below to contact the person who found it.
            Provide specific details in your message that only the true owner would know.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactItemOwnerForm itemId={item.id} itemOwnerEmail={item.contactEmailToClaim} />
        </CardContent>
      </Card>
    </div>
  );
}

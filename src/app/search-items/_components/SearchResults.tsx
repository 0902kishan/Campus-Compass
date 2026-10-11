import { ItemCard } from '@/components/ItemCard';
import { getItems } from '@/lib/mock-data';
import type { Item } from '@/types';
import { PackageOpen } from 'lucide-react';

interface SearchResultsProps {
  query?: string;
  category?: string;
  status?: string;
}

export async function SearchResults({ query = '', category = 'all', status = 'all' }: SearchResultsProps) {
  const allItems = await getItems();

  const filteredItems = allItems.filter((item: Item) => {
    const searchTerm = query.toLowerCase().trim();
    const itemStatus = item.status || 'available';

    // Status filter
    if (status && status !== 'all' && itemStatus !== status) {
      return false;
    }

    // Category filter
    if (category && category !== 'all' && item.category.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    // Text search filter
    if (searchTerm) {
      const matchName = item.name.toLowerCase().includes(searchTerm);
      const matchDesc = item.description.toLowerCase().includes(searchTerm);
      const matchCat = item.category.toLowerCase().includes(searchTerm);
      const matchLoc = item.locationFound.toLowerCase().includes(searchTerm);
      const matchContact = item.contactEmailToClaim?.toLowerCase().includes(searchTerm);
      return matchName || matchDesc || matchCat || matchLoc || matchContact;
    }

    return true;
  });

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-16 border rounded-2xl bg-muted/30 p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">No Items Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
          {query || category !== 'all' || status !== 'all' 
            ? "We couldn't find any items matching your selected criteria. Try adjusting your search keywords or resetting filters." 
            : "There are currently no items posted in the system. Check back later or post a found item!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>Showing <strong className="text-foreground">{filteredItems.length}</strong> {filteredItems.length === 1 ? 'item' : 'items'}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

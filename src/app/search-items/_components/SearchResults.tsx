import { ItemCard } from '@/components/ItemCard';
import { getItems } from '@/lib/mock-data';
import type { Item } from '@/types';

export async function SearchResults({ query }: { query: string }) {
  const allItems = await getItems();

  const filteredItems = allItems.filter((item: Item) => {
    const searchTerm = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm) ||
      item.locationFound.toLowerCase().includes(searchTerm)
    );
  });

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">No Items Found</h2>
        <p className="text-muted-foreground">
          {query ? `We couldn't find any items matching "${query}". Try a different search term.` : "There are currently no items posted. Check back later!"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

import type { Item, ItemCategory } from '@/types';

export const mockItems: Item[] = [
  {
    id: '1',
    name: 'iPhone 13 Pro',
    description: 'Found an iPhone 13 Pro near the library entrance. Sierra Blue color, in a clear case. Screen has a small crack in the top right.',
    category: 'Electronics',
    imageUrl: 'https://picsum.photos/seed/iphone13/400/300',
    locationFound: 'Library Entrance',
    dateFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    contactEmailToClaim: 'finder1@example.com',
  },
  {
    id: '2',
    name: 'Red Scarf',
    description: 'A knitted red scarf, looks handmade. Found on a bench in the main quad.',
    category: 'Clothing',
    imageUrl: 'https://picsum.photos/seed/redscarf/400/300',
    locationFound: 'Main Quad Bench',
    dateFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    contactEmailToClaim: 'finder2@example.com',
  },
  {
    id: '3',
    name: 'Calculus Textbook',
    description: '"Advanced Calculus, 5th Edition". Has some highlighting on chapter 3. Found in lecture hall C.',
    category: 'Books',
    // No imageUrl, will use default
    locationFound: 'Lecture Hall C',
    dateFound: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    contactEmailToClaim: 'finder3@example.com',
  },
  {
    id: '4',
    name: 'Set of Keys',
    description: 'Bunch of keys on a silver carabiner. Includes a small "Star Wars" keychain.',
    category: 'Keys',
    imageUrl: 'https://picsum.photos/seed/keys/400/300',
    locationFound: 'Cafeteria Table 5',
    dateFound: new Date().toISOString(), // Today
    contactEmailToClaim: 'finder4@example.com',
  },
  {
    id: '5',
    name: 'Brown Leather Wallet',
    description: 'Men\'s brown leather wallet. Contains student ID for "Alex Chen". Please verify other contents to claim.',
    category: 'Wallet',
    imageUrl: 'https://picsum.photos/seed/wallet/400/300',
    locationFound: 'Student Union Games Room',
    dateFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    contactEmailToClaim: 'finder5@example.com',
  },
];

// In a real app, these would be server functions
export async function getItems(): Promise<Item[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockItems.sort((a, b) => new Date(b.dateFound).getTime() - new Date(a.dateFound).getTime());
}

export async function getItemById(id: string): Promise<Item | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockItems.find(item => item.id === id);
}

// Simulate adding an item
export async function addItem(itemData: Omit<Item, 'id' | 'dateFound'>): Promise<Item> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newItem: Item = {
    ...itemData,
    id: String(mockItems.length + 1 + Math.random()), // Ensure unique ID for mock
    dateFound: new Date().toISOString(),
  };
  mockItems.unshift(newItem); // Add to the beginning of the array
  return newItem;
}

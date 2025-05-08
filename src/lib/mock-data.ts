import type { Item, ItemCategory, ItemFormData } from '@/types';
import fs from 'fs';
import path from 'path';

// These are the initial items if the DB file doesn't exist or is invalid.
const initialMockItems: Item[] = [
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

const DB_FILE_NAME = 'lost-found-items.db.json';
// Place DB in a writable directory; for local dev, project root or /tmp.
// Using project root here for simplicity in dev. For serverless, /tmp is better.
const DB_PATH = path.join(process.cwd(), DB_FILE_NAME);

function readDb(): Item[] {
  try {
    if (fs.existsSync(DB_PATH)) {
      const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
      // Ensure dates are properly handled if stored as strings
      const items: Item[] = JSON.parse(fileContent);
      return items.map(item => ({
        ...item,
        dateFound: new Date(item.dateFound).toISOString(), // Ensure date is ISO string
      }));
    } else {
      // Initialize DB file with initial items
      fs.writeFileSync(DB_PATH, JSON.stringify(initialMockItems, null, 2), 'utf-8');
      return [...initialMockItems]; // Return a copy
    }
  } catch (error) {
    console.error("Error reading or initializing DB file:", error);
    // Fallback to in-memory initial items if file system fails critically
    // And attempt to re-initialize the file to prevent repeated errors on next ops.
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(initialMockItems, null, 2), 'utf-8');
    } catch (initError) {
        console.error("Failed to re-initialize DB file:", initError);
    }
    return [...initialMockItems]; 
  }
}

function writeDb(items: Item[]): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing to DB file:", error);
    // Depending on requirements, you might want to throw this error
    // or have a more sophisticated error handling/retry mechanism.
  }
}

export async function getItems(): Promise<Item[]> {
  const items = readDb();
  return items.sort((a, b) => new Date(b.dateFound).getTime() - new Date(a.dateFound).getTime());
}

export async function getItemById(id: string): Promise<Item | undefined> {
  const items = readDb();
  return items.find(item => item.id === id);
}

export async function addItem(itemData: Omit<Item, 'id' | 'dateFound'>): Promise<Item> {
  const items = readDb();
  const newItem: Item = {
    ...itemData,
    id: `item-${Date.now()}-${items.length + 1}`, // Generate a unique ID
    dateFound: new Date().toISOString(),
  };
  // Add to the beginning of the array to show newest items first if not re-sorted elsewhere
  const updatedItems = [newItem, ...items]; 
  writeDb(updatedItems);
  return newItem;
}

// Optional: A utility function to reset the database during development
// You could expose this via a secret debug route or CLI command if needed.
export async function resetDbToInitialState(): Promise<void> {
  console.log(`Resetting database at ${DB_PATH} to initial state.`);
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialMockItems, null, 2), 'utf-8');
    console.log('Database reset successfully.');
  } catch (error) {
    console.error('Failed to reset database:', error);
  }
}
// To use resetDbToInitialState, you might call it during app startup in dev mode,
// or through a specific mechanism. For now, it's just defined.
// Example: if (process.env.NODE_ENV === 'development') { resetDbToInitialState(); } (conditionally)

// Note: You should add DB_FILE_NAME (e.g., "lost-found-items.db.json") to your .gitignore file
// to prevent committing the mock database to your repository.

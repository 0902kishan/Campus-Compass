import type { Item, ItemCategory, ItemFormData, Claim, ClaimStatus, User } from '@/types';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_campus_compass_salt').digest('hex');
}

// Initial mock users for demo and testing
const initialMockUsers: User[] = [
  {
    id: 'user-finder-1',
    name: 'Sam Finder',
    email: 'finder1@example.com',
    passwordHash: hashPassword('password123'),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'user-student-1',
    name: 'Alex Student',
    email: 'student@campus.edu',
    passwordHash: hashPassword('password123'),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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
    status: 'available',
    userId: 'user-finder-1',
    posterName: 'Sam Finder',
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
    status: 'available',
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
    status: 'available',
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
    status: 'available',
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
    status: 'available',
  },
];

const DB_FILE_NAME = 'lost-found-items.db.json';
const CLAIMS_DB_FILE_NAME = 'claims.db.json';
const USERS_DB_FILE_NAME = 'users.db.json';
const DB_PATH = path.join(process.cwd(), DB_FILE_NAME);
const CLAIMS_DB_PATH = path.join(process.cwd(), CLAIMS_DB_FILE_NAME);
const USERS_DB_PATH = path.join(process.cwd(), USERS_DB_FILE_NAME);

// --- Users DB ---

function readUsersDb(): User[] {
  try {
    if (fs.existsSync(USERS_DB_PATH)) {
      const fileContent = fs.readFileSync(USERS_DB_PATH, 'utf-8');
      return JSON.parse(fileContent);
    } else {
      fs.writeFileSync(USERS_DB_PATH, JSON.stringify(initialMockUsers, null, 2), 'utf-8');
      return [...initialMockUsers];
    }
  } catch (error) {
    console.error("Error reading users DB file:", error);
    return [...initialMockUsers];
  }
}

function writeUsersDb(users: User[]): void {
  try {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing to users DB file:", error);
  }
}

export async function getUsers(): Promise<User[]> {
  return readUsersDb();
}

export async function getUserById(id: string): Promise<User | undefined> {
  const users = readUsersDb();
  return users.find(u => u.id === id);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = readUsersDb();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
}

export async function createUser(data: { name: string; email: string; password: string }): Promise<User> {
  const users = readUsersDb();
  const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase().trim());
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const newUser: User = {
    id: `user-${Date.now()}-${users.length + 1}`,
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    passwordHash: hashPassword(data.password),
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  writeUsersDb(updatedUsers);
  return newUser;
}

export async function verifyUserPassword(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user || !user.passwordHash) return null;
  const hash = hashPassword(password);
  if (hash === user.passwordHash) {
    return user;
  }
  return null;
}

// --- Items DB ---

function readDb(): Item[] {
  try {
    if (fs.existsSync(DB_PATH)) {
      const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
      const items: Item[] = JSON.parse(fileContent);
      return items.map(item => ({
        ...item,
        dateFound: new Date(item.dateFound).toISOString(),
        status: item.status || 'available', // Backward compat for old data
      }));
    } else {
      fs.writeFileSync(DB_PATH, JSON.stringify(initialMockItems, null, 2), 'utf-8');
      return [...initialMockItems];
    }
  } catch (error) {
    console.error("Error reading or initializing DB file:", error);
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

export async function addItem(itemData: Omit<Item, 'id' | 'dateFound' | 'status'>): Promise<Item> {
  const items = readDb();
  const newItem: Item = {
    ...itemData,
    id: `item-${Date.now()}-${items.length + 1}`,
    dateFound: new Date().toISOString(),
    status: 'available',
  };
  const updatedItems = [newItem, ...items]; 
  writeDb(updatedItems);
  return newItem;
}

export async function updateItemStatus(itemId: string, status: Item['status']): Promise<Item | null> {
  const items = readDb();
  const index = items.findIndex(item => item.id === itemId);
  if (index === -1) return null;
  
  items[index] = { ...items[index], status };
  writeDb(items);
  return items[index];
}

// --- Claims DB ---

function readClaimsDb(): Claim[] {
  try {
    if (fs.existsSync(CLAIMS_DB_PATH)) {
      const fileContent = fs.readFileSync(CLAIMS_DB_PATH, 'utf-8');
      return JSON.parse(fileContent);
    } else {
      fs.writeFileSync(CLAIMS_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
  } catch (error) {
    console.error("Error reading claims DB:", error);
    return [];
  }
}

function writeClaimsDb(claims: Claim[]): void {
  try {
    fs.writeFileSync(CLAIMS_DB_PATH, JSON.stringify(claims, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing to claims DB:", error);
  }
}

export async function addClaim(claimData: Omit<Claim, 'id' | 'createdAt' | 'status'>): Promise<Claim> {
  const claims = readClaimsDb();
  const newClaim: Claim = {
    ...claimData,
    id: `claim-${Date.now()}-${claims.length + 1}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  const updatedClaims = [newClaim, ...claims];
  writeClaimsDb(updatedClaims);
  return newClaim;
}

export async function getClaims(): Promise<Claim[]> {
  const claims = readClaimsDb();
  return claims.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getClaimsByItemId(itemId: string): Promise<Claim[]> {
  const claims = readClaimsDb();
  return claims.filter(c => c.itemId === itemId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateClaimStatus(claimId: string, status: ClaimStatus): Promise<Claim | null> {
  const claims = readClaimsDb();
  const index = claims.findIndex(c => c.id === claimId);
  if (index === -1) return null;
  
  claims[index] = { ...claims[index], status };
  writeClaimsDb(claims);
  return claims[index];
}

export async function deleteItem(itemId: string): Promise<boolean> {
  const items = readDb();
  const filtered = items.filter(item => item.id !== itemId);
  if (filtered.length === items.length) return false;
  writeDb(filtered);
  return true;
}

export async function deleteClaim(claimId: string): Promise<boolean> {
  const claims = readClaimsDb();
  const filtered = claims.filter(c => c.id !== claimId);
  if (filtered.length === claims.length) return false;
  writeClaimsDb(filtered);
  return true;
}

export async function resetDbToInitialState(): Promise<void> {
  console.log(`Resetting databases to initial state.`);
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(initialMockItems, null, 2), 'utf-8');
    fs.writeFileSync(CLAIMS_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(initialMockUsers, null, 2), 'utf-8');
    console.log('Databases reset successfully.');
  } catch (error) {
    console.error('Failed to reset databases:', error);
  }
}


export type ItemCategory = "Electronics" | "Clothing" | "Books" | "Keys" | "Wallet" | "Other";

export type ItemStatus = "available" | "claimed" | "returned";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  createdAt: string;
}

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  imageUrl?: string; // Optional, can use a default category-based image
  locationFound: string;
  dateFound: string; // ISO string date
  contactEmailToClaim: string; // Email of the person who found the item
  status: ItemStatus;
  userId?: string; // ID of the authenticated user who posted the item
  posterName?: string; // Name of the authenticated user who posted the item
}

// For forms using react-hook-form and Zod
export interface ItemFormData {
  name: string;
  description: string;
  category: ItemCategory;
  imageUrl?: string;
  locationFound: string;
  contactEmailToClaim: string;
  userId?: string;
  posterName?: string;
}

export interface ContactFormData {
  userName: string;
  userEmail: string;
  message: string;
  itemId: string; // To know which item this contact is about
  itemOwnerEmail: string; // Email of the person who posted the found item
  claimantId?: string; // Authenticated user ID of the claimant
  itemOwnerId?: string; // Authenticated user ID of the item poster
}

export type ClaimStatus = "pending" | "approved" | "rejected";

export interface Claim {
  id: string;
  itemId: string;
  itemName: string;
  claimantId: string; // ID of the claimant
  claimantName: string;
  claimantEmail: string;
  message: string;
  itemOwnerId?: string; // ID of the item poster
  itemOwnerEmail: string;
  status: ClaimStatus;
  createdAt: string; // ISO string date
}



export type ItemCategory = "Electronics" | "Clothing" | "Books" | "Keys" | "Wallet" | "Other";

export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  imageUrl?: string; // Optional, can use a default category-based image
  locationFound: string;
  dateFound: string; // ISO string date
  contactEmailToClaim: string; // Email of the person who found the item
}

// For forms using react-hook-form and Zod
export interface ItemFormData {
  name: string;
  description: string;
  category: ItemCategory;
  imageUrl?: string;
  locationFound: string;
  contactEmailToClaim: string;
}

export interface ContactFormData {
  userName: string;
  userEmail: string;
  message: string;
  itemId: string; // To know which item this contact is about
  itemOwnerEmail: string; // Email of the person who posted the found item
}

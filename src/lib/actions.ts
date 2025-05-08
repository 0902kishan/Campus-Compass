// src/lib/actions.ts
'use server';

import { z } from 'zod';
import { addItem } from '@/lib/mock-data'; 
import type { ItemFormData, ItemCategory, ContactFormData } from '@/types';
import { revalidatePath } from 'next/cache';

const itemCategories: [ItemCategory, ...ItemCategory[]] = ["Electronics", "Clothing", "Books", "Keys", "Wallet", "Other"];

// Schema for validating form data when posting an item
const ItemFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.enum(itemCategories, { message: "Invalid category." }),
  // imageUrl is optional, but if provided, it must be a valid URL.
  // This will be populated by the Firebase Storage URL after successful upload.
  imageUrl: z.string().url({ message: "Invalid image URL." }).optional().or(z.literal('')),
  locationFound: z.string().min(3, { message: "Location must be at least 3 characters." }),
  contactEmailToClaim: z.string().email({ message: "Please enter a valid email address." }),
});

export async function postFoundItemAction(data: ItemFormData) {
  try {
    const validatedData = ItemFormSchema.parse(data);
    
    const newItem = await addItem(validatedData);
    
    revalidatePath('/search-items'); 
    revalidatePath('/'); 
    revalidatePath(`/items/${newItem.id}`); 
    
    return { success: true, message: 'Item posted successfully!', item: newItem };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Validation failed.', errors: error.flatten().fieldErrors };
    }
    console.error("Error posting item:", error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

const ContactFormSchema = z.object({
  userName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  userEmail: z.string().email({ message: "Please enter a valid email." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  itemId: z.string(),
  itemOwnerEmail: z.string().email(),
});

export async function submitContactFormAction(data: ContactFormData) {
  try {
    const validatedData = ContactFormSchema.parse(data);

    console.log('Contact Form Submitted:');
    console.log('Item ID:', validatedData.itemId);
    console.log('Claimant:', validatedData.userName, `(${validatedData.userEmail})`);
    console.log('Message:', validatedData.message);
    console.log('Send notification to item poster:', validatedData.itemOwnerEmail);

    // Simulate sending a notification
    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true, message: 'Your message has been sent to the item poster.' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Validation failed.', errors: error.flatten().fieldErrors };
    }
    console.error("Error submitting contact form:", error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

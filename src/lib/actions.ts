'use server';

import { z } from 'zod';
import { addItem, getItemById } from '@/lib/mock-data'; // Assuming addItem is in mock-data for now
import type { ItemFormData, ContactFormData, ItemCategory } from '@/types';
import { revalidatePath } from 'next/cache';

const itemCategories: [ItemCategory, ...ItemCategory[]] = ["Electronics", "Clothing", "Books", "Keys", "Wallet", "Other"];

const ItemFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.enum(itemCategories, { message: "Invalid category." }),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  locationFound: z.string().min(3, { message: "Location must be at least 3 characters." }),
  contactEmailToClaim: z.string().email({ message: "Please enter a valid email address." }),
});

export async function postFoundItemAction(data: ItemFormData) {
  try {
    const validatedData = ItemFormSchema.parse(data);
    
    // In a real app, save to database here
    const newItem = await addItem(validatedData);
    
    revalidatePath('/search-items'); // Revalidate search page to show new item
    revalidatePath('/'); // Revalidate home page if it shows recent items
    
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

    // In a real app, you would send an email or notification here
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

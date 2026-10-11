// src/lib/actions.ts
'use server';

import { z } from 'zod';
import { addItem, addClaim, getItemById, updateClaimStatus, updateItemStatus, getClaims, deleteItem, deleteClaim } from '@/lib/mock-data'; 
import type { ItemFormData, ItemCategory, ContactFormData, ClaimStatus, ItemStatus } from '@/types';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth-actions';

const itemCategories: [ItemCategory, ...ItemCategory[]] = ["Electronics", "Clothing", "Books", "Keys", "Wallet", "Other"];

// Schema for validating form data when posting an item
const ItemFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.enum(itemCategories, { message: "Invalid category." }),
  imageUrl: z.string().optional().or(z.literal('')),
  locationFound: z.string().min(3, { message: "Location must be at least 3 characters." }),
  contactEmailToClaim: z.string().email({ message: "Please enter a valid email address." }),
});

export async function postFoundItemAction(data: ItemFormData) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, message: 'Authentication required. Please log in to announce a found item.' };
    }

    const validatedData = ItemFormSchema.parse(data);
    
    // Associate item with the authenticated user
    const newItem = await addItem({
      ...validatedData,
      userId: session.id,
      posterName: session.name,
      contactEmailToClaim: validatedData.contactEmailToClaim || session.email,
    });
    
    revalidatePath('/search-items'); 
    revalidatePath('/'); 
    revalidatePath('/dashboard');
    revalidatePath('/claims');
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
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, message: 'Authentication required. Please sign in to submit a claim.' };
    }

    const validatedData = ContactFormSchema.parse(data);

    // Get the item to include its name in the claim
    const item = await getItemById(validatedData.itemId);
    if (!item) {
      return { success: false, message: 'Item not found.' };
    }

    if (item.status === 'returned') {
      return { success: false, message: 'This item has already been returned to its owner and is closed for claims.' };
    }

    // RULE: Original poster must NOT be allowed to claim their own item
    const isOwner = (item.userId && item.userId === session.id) || 
                    (item.contactEmailToClaim.toLowerCase() === session.email.toLowerCase());
    if (isOwner) {
      return { 
        success: false, 
        message: 'You cannot claim an item that you posted. As the finder, you can review incoming claims in your Dashboard.' 
      };
    }

    // RULE: Prevent duplicate active claim requests from the same user on the same item
    const allClaims = await getClaims();
    const existingClaim = allClaims.find(
      c => c.itemId === item.id && 
           (c.claimantId === session.id || c.claimantEmail.toLowerCase() === session.email.toLowerCase()) &&
           c.status !== 'rejected'
    );
    if (existingClaim) {
      return {
        success: false,
        message: 'You have already submitted an active claim for this item. Please check the Dashboard to track its status.'
      };
    }

    // Store the claim in the database with claimant and owner identifiers
    const claim = await addClaim({
      itemId: validatedData.itemId,
      itemName: item.name,
      claimantId: session.id,
      claimantName: session.name,
      claimantEmail: session.email,
      message: validatedData.message,
      itemOwnerId: item.userId,
      itemOwnerEmail: item.contactEmailToClaim,
    });

    // Update item status to claimed
    await updateItemStatus(validatedData.itemId, 'claimed');

    // Revalidate all relevant pages
    revalidatePath('/');
    revalidatePath('/search-items');
    revalidatePath('/dashboard');
    revalidatePath(`/items/${validatedData.itemId}`);
    revalidatePath('/claims');

    return { 
      success: true, 
      message: `Your claim has been submitted! Claim ID: ${claim.id}. The item finder at ${item.contactEmailToClaim} has been notified. You can track this in your Dashboard.`,
      claim
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Validation failed.', errors: error.flatten().fieldErrors };
    }
    console.error("Error submitting contact form:", error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function updateClaimStatusAction(claimId: string, newStatus: ClaimStatus) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, message: 'Authentication required. Please log in to manage claims.' };
    }

    const allClaims = await getClaims();
    const targetClaim = allClaims.find(c => c.id === claimId);
    if (!targetClaim) {
      return { success: false, message: 'Claim not found.' };
    }

    const item = await getItemById(targetClaim.itemId);

    // RULE: Authorize that only the item poster can approve or reject the claim
    const isOwner = (item && item.userId && item.userId === session.id) ||
                    (targetClaim.itemOwnerId && targetClaim.itemOwnerId === session.id) ||
                    (targetClaim.itemOwnerEmail.toLowerCase() === session.email.toLowerCase());
    
    if (!isOwner) {
      return { 
        success: false, 
        message: 'Permission denied. Only the person who posted this item can approve or reject claims.' 
      };
    }

    const claim = await updateClaimStatus(claimId, newStatus);
    if (!claim) {
      return { success: false, message: 'Claim not found.' };
    }

    // If approved, mark the item as returned and auto-reject remaining pending claims
    if (newStatus === 'approved') {
      await updateItemStatus(claim.itemId, 'returned');
      // Auto-reject any other pending claims for this item
      const pendingOthers = allClaims.filter(c => c.itemId === claim.itemId && c.id !== claimId && c.status === 'pending');
      for (const other of pendingOthers) {
        await updateClaimStatus(other.id, 'rejected');
      }
    } else if (newStatus === 'rejected') {
      // Check if there are other pending claims for this item
      const otherPending = allClaims.some(c => c.itemId === claim.itemId && c.id !== claimId && c.status === 'pending');
      if (!otherPending) {
        // No other pending claims, automatically revert item back to available
        await updateItemStatus(claim.itemId, 'available');
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/claims');
    revalidatePath('/');
    revalidatePath('/search-items');
    revalidatePath(`/items/${claim.itemId}`);

    return { 
      success: true, 
      message: newStatus === 'approved' 
        ? `Claim approved! The item has been automatically marked as reunited/returned.`
        : `Claim rejected. If no other pending claims exist, the item is automatically available.`
    };
  } catch (error) {
    console.error("Error updating claim status:", error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function updateItemStatusAction(itemId: string, newStatus: ItemStatus) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, message: 'Authentication required. Please log in.' };
    }

    const item = await getItemById(itemId);
    if (!item) {
      return { success: false, message: 'Item not found.' };
    }

    // Only original poster may manually update status
    const isOwner = (item.userId && item.userId === session.id) || 
                    (item.contactEmailToClaim.toLowerCase() === session.email.toLowerCase());
    if (!isOwner) {
      return { success: false, message: 'Permission denied. Only the person who announced this item can update its status.' };
    }

    const updated = await updateItemStatus(itemId, newStatus);
    if (!updated) {
      return { success: false, message: 'Item not found.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/claims');
    revalidatePath('/');
    revalidatePath('/search-items');
    revalidatePath(`/items/${itemId}`);

    return {
      success: true,
      message: `Item status updated to "${newStatus}".`,
      item: updated
    };
  } catch (error) {
    console.error("Error updating item status:", error);
    return { success: false, message: 'Failed to update item status.' };
  }
}

export async function deleteItemAction(itemId: string) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, message: 'Authentication required. Please log in.' };
    }

    const item = await getItemById(itemId);
    if (!item) {
      return { success: false, message: 'Item not found or already deleted.' };
    }

    // Only original poster may delete their listing
    const isOwner = (item.userId && item.userId === session.id) || 
                    (item.contactEmailToClaim.toLowerCase() === session.email.toLowerCase());
    if (!isOwner) {
      return { success: false, message: 'Permission denied. Only the finder who announced this item can remove it.' };
    }

    const success = await deleteItem(itemId);
    if (!success) {
      return { success: false, message: 'Item not found or already deleted.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/claims');
    revalidatePath('/');
    revalidatePath('/search-items');

    return { success: true, message: 'Item removed successfully.' };
  } catch (error) {
    console.error("Error deleting item:", error);
    return { success: false, message: 'Failed to delete item.' };
  }
}

export async function deleteClaimAction(claimId: string) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return { success: false, message: 'Authentication required. Please log in.' };
    }

    const allClaims = await getClaims();
    const claim = allClaims.find(c => c.id === claimId);
    if (!claim) {
      return { success: false, message: 'Claim not found or already deleted.' };
    }

    // Only the claimant or the item owner can delete the claim record
    const isAuthorized = claim.claimantId === session.id || 
                         claim.claimantEmail.toLowerCase() === session.email.toLowerCase() ||
                         (claim.itemOwnerId && claim.itemOwnerId === session.id) ||
                         claim.itemOwnerEmail.toLowerCase() === session.email.toLowerCase();
    if (!isAuthorized) {
      return { success: false, message: 'Permission denied to delete this claim record.' };
    }

    const success = await deleteClaim(claimId);
    if (!success) {
      return { success: false, message: 'Claim not found or already deleted.' };
    }

    // If claim was pending, check if item should revert to available
    if (claim.status === 'pending') {
      const remainingPending = allClaims.some(c => c.itemId === claim.itemId && c.id !== claimId && c.status === 'pending');
      if (!remainingPending) {
        await updateItemStatus(claim.itemId, 'available');
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/claims');
    revalidatePath(`/items/${claim.itemId}`);

    return { success: true, message: 'Claim removed successfully.' };
  } catch (error) {
    console.error("Error deleting claim:", error);
    return { success: false, message: 'Failed to delete claim.' };
  }
}

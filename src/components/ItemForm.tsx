'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ItemFormData, ItemCategory } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { postFoundItemAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const itemCategories: ItemCategory[] = ["Electronics", "Clothing", "Books", "Keys", "Wallet", "Other"];

const ItemFormSchema = z.object({
  name: z.string().min(3, { message: "Item name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.enum(itemCategories as [string, ...string[]], { message: "Please select a category." }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
  locationFound: z.string().min(3, { message: "Location found must be at least 3 characters." }),
  contactEmailToClaim: z.string().email({ message: "Please enter a valid email address for contact." }),
});

export function ItemForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof ItemFormSchema>>({
    resolver: zodResolver(ItemFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: undefined,
      imageUrl: '',
      locationFound: '',
      contactEmailToClaim: '',
    },
  });

  async function onSubmit(values: z.infer<typeof ItemFormSchema>) {
    setIsSubmitting(true);
    const result = await postFoundItemAction(values as ItemFormData);
    setIsSubmitting(false);

    if (result.success && result.item) {
      toast({
        title: "Success!",
        description: result.message,
      });
      router.push(`/items/${result.item.id}`); // Navigate to the newly created item's page
      form.reset();
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to post item. Please try again.",
        variant: "destructive",
      });
      // Handle field-specific errors if your action returns them
      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field as keyof ItemFormData, {
            type: 'manual',
            message: (messages as string[]).join(', '),
          });
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Red Backpack, iPhone 12" {...field} />
              </FormControl>
              <FormDescription>A short, descriptive name for the item.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide details like brand, color, specific markings, or where exactly it was found."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Be as specific as possible to help the owner identify it.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {itemCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Choose the category that best fits the item.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormDescription>
                If you have an image of the item, paste the URL here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="locationFound"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Found</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Library, 2nd floor, near the window" {...field} />
              </FormControl>
              <FormDescription>Where on campus did you find this item?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactEmailToClaim"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Contact Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormDescription>
                The owner will use this email to contact you if they believe this is their item.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Post Found Item'
          )}
        </Button>
      </form>
    </Form>
  );
}

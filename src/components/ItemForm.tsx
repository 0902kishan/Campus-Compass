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
import { Loader2, CheckCircle } from 'lucide-react';
import Image from 'next/image';

const itemCategories: ItemCategory[] = ["Electronics", "Clothing", "Books", "Keys", "Wallet", "Other"];

const ItemFormSchema = z.object({
  name: z.string().min(3, { message: "Item name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  category: z.enum(itemCategories as [string, ...string[]], { message: "Please select a category." }),
  imageUrl: z.string().optional().or(z.literal('')),
  locationFound: z.string().min(3, { message: "Location found must be at least 3 characters." }),
  contactEmailToClaim: z.string().email({ message: "Please enter a valid email address for contact." }),
});

interface ItemFormProps {
  defaultEmail?: string;
}

export function ItemForm({ defaultEmail = '' }: ItemFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof ItemFormSchema>>({
    resolver: zodResolver(ItemFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: undefined,
      imageUrl: '',
      locationFound: '',
      contactEmailToClaim: defaultEmail,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadError(null);

      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        setUploadError('Invalid file type. Please upload a JPG, PNG, WebP, or GIF.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File is too large. Maximum size is 5MB.');
        return;
      }
      
      // Convert image to base64 data URL for local preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreviewUrl(dataUrl);
        form.setValue('imageUrl', dataUrl, { shouldValidate: true });
      };
      reader.onerror = () => {
        setUploadError('Failed to read the image file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreviewUrl(null);
    form.setValue('imageUrl', '', { shouldValidate: true });
  };

  async function onSubmit(values: z.infer<typeof ItemFormSchema>) {
    setIsSubmittingForm(true);
    const result = await postFoundItemAction(values as ItemFormData);
    setIsSubmittingForm(false);

    if (result.success && result.item) {
      toast({ title: "Success!", description: result.message });
      router.refresh();
      router.push(`/items/${result.item.id}`); 
      form.reset();
      setImagePreviewUrl(null);
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to post item.",
        variant: "destructive",
      });
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
                <Input placeholder="e.g., Red Backpack" {...field} />
              </FormControl>
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
                <Textarea placeholder="Details to help identification..." {...field} />
              </FormControl>
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
                <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                <SelectContent>
                  {itemCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
          <FormLabel>Photo Upload (Optional)</FormLabel>
          <FormControl>
            <Input 
              type="file" 
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
              disabled={isSubmittingForm}
            />
          </FormControl>
          {uploadError && <p className="text-sm text-destructive mt-2">{uploadError}</p>}
          {imagePreviewUrl && (
            <div className="mt-4 space-y-2">
              <div className="relative w-full h-48 rounded-md overflow-hidden border">
                <Image src={imagePreviewUrl} alt="Preview" fill className="object-cover" unoptimized />
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Image ready</span>
                <Button type="button" variant="ghost" size="sm" onClick={handleRemoveImage} className="ml-auto text-destructive hover:text-destructive">
                  Remove
                </Button>
              </div>
            </div>
          )}
          <FormMessage />
        </FormItem>

        <FormField
          control={form.control}
          name="locationFound"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Found</FormLabel>
              <FormControl><Input placeholder="e.g., Library" {...field} /></FormControl>
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
              <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmittingForm}>
          {isSubmittingForm ? <Loader2 className="animate-spin mr-2" /> : null}
          Post Found Item
        </Button>
      </form>
    </Form>
  );
}

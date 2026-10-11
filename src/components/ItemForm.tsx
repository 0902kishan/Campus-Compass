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
import { Progress } from '@/components/ui/progress';
import { postFoundItemAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useStorage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

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
  const storage = useStorage();
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePathInStorage, setImagePathInStorage] = useState<string | null>(null);

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

  useEffect(() => {
    return () => {
      if (storage && imagePathInStorage && !form.formState.isSubmitSuccessful) {
        const imageRef = ref(storage, imagePathInStorage);
        deleteObject(imageRef).catch(e => console.warn("Cleanup failed:", e));
      }
    };
  }, [imagePathInStorage, form.formState.isSubmitSuccessful, storage]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setUploadError('Invalid file type. Please upload a JPG or PNG.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File is too large. Maximum size is 5MB.');
        return;
      }
      
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  const handleImageUpload = (file: File) => {
    setIsUploadingImage(true);
    setUploadProgress(0);
    
    const filePath = `items/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        setUploadError(`Upload failed: ${error.message}`);
        setIsUploadingImage(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setUploadedImageUrl(downloadURL);
        form.setValue('imageUrl', downloadURL, { shouldValidate: true });
        setImagePathInStorage(filePath); 
        setIsUploadingImage(false);
      }
    );
  };

  async function onSubmit(values: z.infer<typeof ItemFormSchema>) {
    setIsSubmittingForm(true);
    const result = await postFoundItemAction(values as ItemFormData);
    setIsSubmittingForm(false);

    if (result.success && result.item) {
      toast({ title: "Success!", description: result.message });
      router.push(`/items/${result.item.id}`); 
      form.reset();
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
              accept="image/*"
              onChange={handleImageChange}
              disabled={isUploadingImage || isSubmittingForm}
            />
          </FormControl>
          {isUploadingImage && <Progress value={uploadProgress} className="mt-2" />}
          {uploadError && <p className="text-sm text-destructive mt-2">{uploadError}</p>}
          {uploadedImageUrl && (
            <div className="mt-4 relative w-full h-48 rounded-md overflow-hidden border">
              <Image src={uploadedImageUrl} alt="Preview" fill className="object-cover" />
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
        <Button type="submit" className="w-full sm:w-auto" disabled={isUploadingImage || isSubmittingForm}>
          {isSubmittingForm ? <Loader2 className="animate-spin mr-2" /> : null}
          {isUploadingImage ? 'Uploading...' : 'Post Found Item'}
        </Button>
      </form>
    </Form>
  );
}

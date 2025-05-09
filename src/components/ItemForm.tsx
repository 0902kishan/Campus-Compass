
// src/components/ItemForm.tsx
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
import { storage } from '@/lib/firebase'; // Firebase storage instance
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
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imagePathInStorage, setImagePathInStorage] = useState<string | null>(null);
  const [storageUnavailableError, setStorageUnavailableError] = useState<string | null>(null);


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
    if (!storage) {
      const errorMessage = 'Image upload functionality is unavailable. Firebase Storage may not be configured correctly (e.g., missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in .env.local).';
      setStorageUnavailableError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: errorMessage,
        duration: 300000, // Long duration for visibility
      });
    }
  }, [toast]);

  useEffect(() => {
    // Component unmount or dependency change cleanup for uploaded image if form not submitted
    return () => {
      if (storage && imagePathInStorage && !form.formState.isSubmitSuccessful) {
        const imageRef = ref(storage, imagePathInStorage);
        deleteObject(imageRef)
          .catch(error => console.warn("Cleanup failed for image:", imagePathInStorage, error));
      } else if (!storage && imagePathInStorage) {
        // If storage became unavailable after upload started but before submission, log this.
        console.warn("Storage not available, cannot perform automatic cleanup for image:", imagePathInStorage);
      }
    };
  }, [imagePathInStorage, form.formState.isSubmitSuccessful]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (storageUnavailableError) {
      toast({ variant: 'destructive', title: 'Upload Disabled', description: storageUnavailableError });
      event.target.value = ''; // Clear the input
      return;
    }
    if (!storage) {
      const errorMsg = 'Image upload service is not configured.';
      setUploadError(errorMsg);
      toast({ variant: 'destructive', title: 'Upload Failed', description: errorMsg });
      event.target.value = ''; // Clear the input
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setUploadError('Invalid file type. Please upload a JPG or PNG image.');
        setImageFile(null);
        setUploadedImageUrl(null);
        form.setValue('imageUrl', '');
        event.target.value = ''; // Clear the input
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setUploadError('File is too large. Maximum size is 5MB.');
        setImageFile(null);
        setUploadedImageUrl(null);
        form.setValue('imageUrl', '');
        event.target.value = ''; // Clear the input
        return;
      }
      
      if (imagePathInStorage) {
        const oldImageRef = ref(storage, imagePathInStorage);
        deleteObject(oldImageRef).catch(error => console.warn("Failed to delete old image:", imagePathInStorage, error));
        setImagePathInStorage(null);
      }

      setImageFile(file);
      setUploadedImageUrl(null); 
      form.setValue('imageUrl', '');
      setUploadError(null);
      handleImageUpload(file);
    }
  };

  const handleImageUpload = (file: File) => {
    if (!storage) { // Double check, though UI should prevent this
      setUploadError('Image upload service is not available. Cannot upload file.');
      setIsUploadingImage(false);
      setImageFile(null);
      setUploadedImageUrl(null);
      form.setValue('imageUrl', '');
      return;
    }

    setIsUploadingImage(true);
    setUploadProgress(0);
    setUploadError(null);
    
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
        console.error("Upload failed:", error);
        setUploadError(`Upload failed: ${error.message}`);
        setIsUploadingImage(false);
        setUploadProgress(null);
        setImageFile(null);
        form.setValue('imageUrl', '', { shouldValidate: true });
        setUploadedImageUrl(null);
        setImagePathInStorage(null);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadedImageUrl(downloadURL);
          form.setValue('imageUrl', downloadURL, { shouldValidate: true });
          setImagePathInStorage(filePath); 
          setUploadError(null);
          setUploadProgress(100);
        } catch (error) {
            console.error("Failed to get download URL:", error);
            setUploadError('Failed to get image URL after upload.');
            form.setValue('imageUrl', '', { shouldValidate: true });
            setUploadedImageUrl(null);
            // Keep imagePathInStorage for potential manual cleanup if needed, 
            // or decide to delete it if URL retrieval is critical for form flow.
            // For now, we keep it, and submission might fail or proceed without URL.
        } finally {
            setIsUploadingImage(false);
        }
      }
    );
  };

  async function onSubmit(values: z.infer<typeof ItemFormSchema>) {
    if (isUploadingImage) {
      toast({
        title: "Please wait",
        description: "Image is still uploading.",
        variant: "default", // Changed from destructive as it's informational
      });
      return;
    }

    if (storageUnavailableError && values.imageUrl) {
         toast({
            title: "Submission Error",
            description: `${storageUnavailableError} Cannot submit with an image.`,
            variant: "destructive",
        });
        setIsSubmittingForm(false); // ensure form is not stuck in submitting state
        return;
    }
    
    // If an image was selected but its URL wasn't obtained (e.g., upload failed silently or getDownloadURL failed)
    // and storage is supposed to be available.
    if (imageFile && !form.getValues('imageUrl') && !uploadError && !storageUnavailableError) {
        toast({
            title: "Image Issue",
            description: "Image was selected but its URL is missing. Please try re-uploading or remove the image.",
            variant: "destructive",
        });
        setIsSubmittingForm(false);
        return;
    }


    const submissionValues = { ...values, imageUrl: form.getValues('imageUrl') || '' };

    setIsSubmittingForm(true);
    const result = await postFoundItemAction(submissionValues as ItemFormData);
    setIsSubmittingForm(false);

    if (result.success && result.item) {
      toast({
        title: "Success!",
        description: result.message,
      });
      router.push(`/items/${result.item.id}`); 
      form.reset();
      setImageFile(null);
      setUploadedImageUrl(null);
      setUploadProgress(null);
      setUploadError(null);
      setImagePathInStorage(null); 
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to post item. Please try again.",
        variant: "destructive",
      });
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

  const finalIsSubmitDisabled = isUploadingImage || isSubmittingForm || !!storageUnavailableError;

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
        
        <FormItem>
          <FormLabel>Photo Upload (Optional)</FormLabel>
          <FormControl>
            <Input 
              type="file" 
              accept="image/jpeg, image/png"
              onChange={handleImageChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              disabled={isUploadingImage || isSubmittingForm || !!storageUnavailableError}
            />
          </FormControl>
          <FormDescription>
            Upload a JPG or PNG image (max 5MB).
          </FormDescription>

          {storageUnavailableError && !uploadError && (
            <p className="mt-2 text-sm text-destructive flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" /> {storageUnavailableError}
            </p>
          )}

          {isUploadingImage && uploadProgress !== null && uploadProgress < 100 && !storageUnavailableError && (
            <div className="mt-2 space-y-1">
              <Progress value={uploadProgress} className="w-full h-2" />
              <p className="text-sm text-muted-foreground">{`Uploading: ${Math.round(uploadProgress)}%`}</p>
            </div>
          )}
          {uploadError && !storageUnavailableError && ( // Only show specific upload error if general storage isn't the issue shown
            <p className="mt-2 text-sm text-destructive flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" /> {uploadError}
            </p>
          )}
          {uploadedImageUrl && !isUploadingImage && !uploadError && uploadProgress === 100 && !storageUnavailableError && (
            <div className="mt-4">
              <p className="text-sm text-green-600 flex items-center mb-2">
                <CheckCircle className="w-4 h-4 mr-1" /> Image uploaded successfully.
              </p>
              <div className="relative w-full max-w-xs h-48 rounded-md overflow-hidden border">
                <Image src={uploadedImageUrl} alt="Uploaded preview" fill style={{objectFit:"cover"}} />
              </div>
            </div>
          )}
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => <Input type="hidden" {...field} />}
          />
           <FormMessage>{form.formState.errors.imageUrl?.message}</FormMessage>
        </FormItem>

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
        <Button type="submit" className="w-full sm:w-auto" disabled={finalIsSubmitDisabled}>
          {isSubmittingForm ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : isUploadingImage ? (
             <>
              <UploadCloud className="mr-2 h-4 w-4 animate-pulse" />
              Uploading Image...
            </>
          ) : (
            'Post Found Item'
          )}
        </Button>
      </form>
    </Form>
  );
}

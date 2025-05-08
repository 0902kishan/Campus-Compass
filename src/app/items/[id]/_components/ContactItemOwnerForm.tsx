'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ContactFormData } from '@/types';
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
import { submitContactFormAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const ContactFormSchema = z.object({
  userName: z.string().min(2, { message: "Your name must be at least 2 characters." }),
  userEmail: z.string().email({ message: "Please enter your valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters. Describe the item to prove ownership." }),
});

interface ContactItemOwnerFormProps {
  itemId: string;
  itemOwnerEmail: string;
}

export function ContactItemOwnerForm({ itemId, itemOwnerEmail }: ContactItemOwnerFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof ContactFormSchema>>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      userName: '',
      userEmail: '',
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof ContactFormSchema>) {
    setIsSubmitting(true);
    const formData: ContactFormData = {
      ...values,
      itemId,
      itemOwnerEmail,
    };
    
    const result = await submitContactFormAction(formData);
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Message Sent!",
        description: result.message,
      });
      form.reset();
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
      if (result.errors) {
         Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field as keyof z.infer<typeof ContactFormSchema>, { // Cast field to the correct type
            type: 'manual',
            message: (messages as string[]).join(', '),
          });
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="userName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormDescription>The person who found the item will reply to this email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message to Item Poster</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the item in detail (e.g., specific contents of a wallet, unique scratches on a phone, brand of clothing) to help confirm it's yours."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide enough detail for the poster to verify your ownership. Do not share sensitive personal information here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Message to Claim'
          )}
        </Button>
      </form>
    </Form>
  );
}

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

import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const ContactFormSchema = z.object({
  userName: z.string().min(2, { message: "Your name must be at least 2 characters." }),
  userEmail: z.string().email({ message: "Please enter your valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters. Describe the item to prove ownership." }),
});

interface ContactItemOwnerFormProps {
  itemId: string;
  itemOwnerEmail: string;
  itemName?: string;
  defaultClaimantName?: string;
  defaultClaimantEmail?: string;
}

export function ContactItemOwnerForm({ 
  itemId, 
  itemOwnerEmail, 
  itemName,
  defaultClaimantName = '',
  defaultClaimantEmail = ''
}: ContactItemOwnerFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedClaimId, setSubmittedClaimId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof ContactFormSchema>>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      userName: defaultClaimantName,
      userEmail: defaultClaimantEmail,
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
        title: "Claim Submitted!",
        description: result.message,
      });
      setSubmittedClaimId(result.claim?.id || 'pending');
      form.reset();
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
      if (result.errors) {
         Object.entries(result.errors).forEach(([field, messages]) => {
          form.setError(field as keyof z.infer<typeof ContactFormSchema>, {
            type: 'manual',
            message: (messages as string[]).join(', '),
          });
        });
      }
    }
  }

  if (submittedClaimId) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Claim Successfully Registered!</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Your ownership claim for <strong>{itemName || 'this item'}</strong> has been sent to the finder ({itemOwnerEmail}).
          </p>
        </div>
        <div className="bg-background/80 rounded-lg p-3 inline-block border text-xs font-mono text-muted-foreground">
          Claim Tracking ID: <span className="font-bold text-foreground">{submittedClaimId}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/dashboard">
              Track in Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </Button>
          <Button variant="outline" onClick={() => setSubmittedClaimId(null)}>
            Submit Another Note
          </Button>
        </div>
      </div>
    );
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

import { ItemForm } from '@/components/ItemForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth-actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function PostItemPage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect('/login?redirect=/post-item');
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Announce a Found Item</h1>
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">
          Posting as <strong className="text-foreground">{session.name}</strong> ({session.email}). Help reunite lost items with their owners by sharing details below.
        </p>
      </div>
      <Card className="max-w-3xl mx-auto shadow-xl border-border/70">
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
          <CardDescription>
            Fill out the form below with as much detail as possible.
            Your registered campus email ({session.email}) will receive claim inquiries when students reach out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItemForm defaultEmail={session.email} />
        </CardContent>
      </Card>
    </div>
  );
}

import { ItemForm } from '@/components/ItemForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PostItemPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Found Something?</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Help reunite lost items with their owners by posting the details below.
        </p>
      </div>
      <Card className="max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle>Post a Found Item</CardTitle>
          <CardDescription>
            Fill out the form below with as much detail as possible.
            Your contact email will be used by individuals who believe this item is theirs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItemForm />
        </CardContent>
      </Card>
    </div>
  );
}

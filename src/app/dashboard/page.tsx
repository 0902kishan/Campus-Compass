import { getItems, getClaims } from '@/lib/mock-data';
import { DashboardClient } from './_components/DashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Campus Lost & Found Dashboard | Campus Compass',
  description: 'Manage announced items, view collected belongings, and review claims & connections.',
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const tab = resolvedParams.tab || 'announced';

  const [items, claims] = await Promise.all([
    getItems(),
    getClaims(),
  ]);

  return (
    <div className="container max-w-7xl mx-auto py-4">
      <DashboardClient initialItems={items} initialClaims={claims} initialTab={tab} />
    </div>
  );
}

import DashboardContent from '@/components/dashboard-content';
import type { LeadStatus } from '@/lib/definitions';

type View = 'all' | 'to-manage' | 'managed';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: View }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentView = resolvedSearchParams?.view || 'to-manage';

  return <DashboardContent initialView={currentView} />;
}

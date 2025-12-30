import DashboardContent from '@/components/dashboard-content';

type View = 'all' | 'to-manage' | 'managed';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: View }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentView = resolvedSearchParams?.view || 'all';

  return <DashboardContent initialView={currentView} />;
}

import { getLeads, getAllLeads } from '@/lib/data';
import LeadsTable from '@/components/leads-table';
import { LeadStatus } from '@/lib/definitions';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import KpiCard from '@/components/kpi-card';
import { List, Phone, PhoneForwarded } from 'lucide-react';

type View = 'all' | 'to-manage' | 'managed';

const viewConfig: Record<
  View,
  { title: string; status?: LeadStatus; tabLabel: string }
> = {
  all: {
    title: 'Tutte le lead',
    tabLabel: 'Tutte le lead',
  },
  'to-manage': {
    title: 'Lead da gestire',
    status: 'Da gestire',
    tabLabel: 'Lead da gestire',
  },
  managed: {
    title: 'Lead gestite',
    status: 'Gestita',
    tabLabel: 'Lead gestite',
  },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { view?: View };
}) {
  const currentView = searchParams?.view || 'all';
  const { title, status } = viewConfig[currentView];

  const leadsForTable = await getLeads(status);
  const allLeads = await getAllLeads();

  const totalLeads = allLeads.length;
  const leadsToManage = allLeads.filter(
    (lead) => lead.status === 'Da gestire'
  ).length;
  const leadsManaged = allLeads.filter(
    (lead) => lead.status === 'Gestita'
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground">
          Dashboard Lead
        </h1>
        <p className="mt-1 text-muted-foreground">
          Monitora e gestisci tutte le telefonate in arrivo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <KpiCard title="Totale lead ricevute" value={totalLeads} icon={<List className="size-6" />} />
        <KpiCard title="Lead da gestire" value={leadsToManage} icon={<Phone className="size-6" />} />
        <KpiCard title="Lead gestite" value={leadsManaged} icon={<PhoneForwarded className="size-6" />} />
      </div>

      <Tabs defaultValue={currentView}>
        <TabsList>
          <TabsTrigger value="all" asChild>
            <Link href="/?view=all">{viewConfig.all.tabLabel}</Link>
          </TabsTrigger>
          <TabsTrigger value="to-manage" asChild>
            <Link href="/?view=to-manage">
              {viewConfig['to-manage'].tabLabel}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="managed" asChild>
            <Link href="/?view=managed">{viewConfig.managed.tabLabel}</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <LeadsTable leads={leadsForTable} title={title} />
    </div>
  );
}

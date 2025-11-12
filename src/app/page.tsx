import { getLeads } from '@/lib/data';
import LeadsTable from '@/components/leads-table';
import { LeadStatus } from '@/lib/definitions';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

type View = 'all' | 'to-contact' | 'closed';

const viewConfig: Record<
  View,
  { title: string; status?: LeadStatus; tabLabel: string }
> = {
  all: {
    title: 'Tutte le lead',
    tabLabel: 'Tutte le lead',
  },
  'to-contact': {
    title: 'Lead da Contattare',
    status: 'Da contattare',
    tabLabel: 'Da Contattare',
  },
  closed: {
    title: 'Lead Chiuse',
    status: 'Contattato',
    tabLabel: 'Lead Chiuse',
  },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { view?: View };
}) {
  const currentView = searchParams?.view || 'all';
  const { title, status } = viewConfig[currentView];

  const leads = await getLeads(status);

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
      
      <Tabs defaultValue={currentView}>
        <TabsList>
          <TabsTrigger value="all" asChild>
            <Link href="/?view=all">{viewConfig.all.tabLabel}</Link>
          </TabsTrigger>
          <TabsTrigger value="to-contact" asChild>
            <Link href="/?view=to-contact">{viewConfig['to-contact'].tabLabel}</Link>
          </TabsTrigger>
          <TabsTrigger value="closed" asChild>
            <Link href="/?view=closed">{viewConfig.closed.tabLabel}</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <LeadsTable leads={leads} title={title} />
    </div>
  );
}

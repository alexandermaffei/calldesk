import { getLeads } from '@/lib/data';
import LeadsTable from '@/components/leads-table';

export default async function DashboardPage() {
  const leads = await getLeads();

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
      <LeadsTable leads={leads} />
    </div>
  );
}

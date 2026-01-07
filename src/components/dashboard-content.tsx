"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import LeadsTable from '@/components/leads-table';
import { LeadStatus, Lead } from '@/lib/definitions';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import KpiCard from '@/components/kpi-card';
import { List, Phone, PhoneForwarded, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

interface DashboardContentProps {
  initialView?: View;
}

export default function DashboardContent({ initialView = 'all' }: DashboardContentProps) {
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<View>(initialView);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [leadsToManageCount, setLeadsToManageCount] = useState(0);
  const [leadsManagedCount, setLeadsManagedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async (view: View, userEmail: string) => {
    setLoading(true);
    try {
      const { status } = viewConfig[view];
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('view', view);

      const response = await fetch(`/api/leads?${params.toString()}`, {
        headers: {
          'x-user-email': userEmail,
        },
      });

      if (!response.ok) {
        throw new Error('Errore nel recupero delle lead');
      }

      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Errore nel recupero delle lead:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLeads = async (userEmail: string) => {
    try {
      const params = new URLSearchParams();
      params.append('view', 'all');

      const response = await fetch(`/api/leads?${params.toString()}`, {
        headers: {
          'x-user-email': userEmail,
        },
      });

      if (!response.ok) {
        throw new Error('Errore nel recupero delle lead');
      }

      const data = await response.json();
      setAllLeads(data);
      
      // Calculate KPI counts from the filtered leads
      const toManage = data.filter((lead: Lead) => lead.status === 'Da gestire');
      const managed = data.filter((lead: Lead) => lead.status === 'Gestita');
      setLeadsToManageCount(toManage.length);
      setLeadsManagedCount(managed.length);
    } catch (error) {
      console.error('Errore nel recupero delle lead:', error);
      setAllLeads([]);
      setLeadsToManageCount(0);
      setLeadsManagedCount(0);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.email) {
      fetchLeads(currentView, user.email);
      fetchAllLeads(user.email);
    }
  }, [currentView, user?.email, authLoading]);

  if (authLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="mt-1 h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">Effettua il login per visualizzare le lead</p>
      </div>
    );
  }

  const { title } = viewConfig[currentView];
  const totalLeads = allLeads.length;

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
        <KpiCard title="Lead da gestire" value={leadsToManageCount} icon={<Phone className="size-6" />} />
        <KpiCard title="Lead gestite" value={leadsManagedCount} icon={<PhoneForwarded className="size-6" />} />
      </div>

      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as View)}>
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <LeadsTable leads={leads} title={title} />
      )}
    </div>
  );
}


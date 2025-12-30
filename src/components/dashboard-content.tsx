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
  const [leadsToManage, setLeadsToManage] = useState<Lead[]>([]);
  const [leadsManaged, setLeadsManaged] = useState<Lead[]>([]);
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
        throw new Error('Errore nel recupero dei lead');
      }

      const fetchedLeads: Lead[] = await response.json();
      setLeads(fetchedLeads);
    } catch (error) {
      console.error('Errore nel recupero dei lead:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLeads = async (userEmail: string) => {
    try {
      const response = await fetch('/api/leads?view=all', {
        headers: {
          'x-user-email': userEmail,
        },
      });

      if (!response.ok) {
        throw new Error('Errore nel recupero dei lead');
      }

      const fetchedLeads: Lead[] = await response.json();
      setAllLeads(fetchedLeads);
    } catch (error) {
      console.error('Errore nel recupero di tutte le lead:', error);
      setAllLeads([]);
    }
  };

  const fetchLeadsByStatus = async (userEmail: string) => {
    try {
      // Recupera le lead "Da gestire" filtrate per ruolo
      const toManageResponse = await fetch('/api/leads?status=Da gestire&view=to-manage', {
        headers: {
          'x-user-email': userEmail,
        },
      });

      // Recupera le lead "Gestite" filtrate per ruolo
      const managedResponse = await fetch('/api/leads?status=Gestita&view=managed', {
        headers: {
          'x-user-email': userEmail,
        },
      });

      if (!toManageResponse.ok || !managedResponse.ok) {
        throw new Error('Errore nel recupero dei lead per status');
      }

      const toManageLeads: Lead[] = await toManageResponse.json();
      const managedLeads: Lead[] = await managedResponse.json();
      
      setLeadsToManage(toManageLeads);
      setLeadsManaged(managedLeads);
    } catch (error) {
      console.error('Errore nel recupero dei lead per status:', error);
      setLeadsToManage([]);
      setLeadsManaged([]);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.email) {
      fetchLeads(currentView, user.email);
      fetchAllLeads(user.email);
      fetchLeadsByStatus(user.email);
    }
  }, [currentView, user?.email, authLoading]);

  // Aggiorna la view quando cambia l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = (params.get('view') as View) || 'all';
    if (view !== currentView) {
      setCurrentView(view);
    }
  }, []);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
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

  const { title } = viewConfig[currentView];
  const totalLeads = allLeads.length;
  const leadsToManageCount = leadsToManage.length;
  const leadsManagedCount = leadsManaged.length;

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

      <LeadsTable leads={leads} title={title} />
    </div>
  );
}


"use client";

import { useState, useEffect, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';
import { ArrowLeft, Car, Phone, User, NotebookText, Tag, Clock, Calendar, Building, Info, MessageSquareQuote } from 'lucide-react';

import type { Lead } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusUpdater } from '@/components/status-updater';
import { Skeleton } from '@/components/ui/skeleton';
import { OperatorNotesEditor } from '@/components/operator-notes-editor';

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchLead = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leads/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
          return;
        }
        throw new Error('Errore nel recupero del lead');
      }
      const fetchedLead: Lead = await response.json();
      setLead(fetchedLead);
    } catch (error) {
      console.error('Errore nel recupero del lead:', error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLead(id);
    }
  }, [id]);

  const handleStatusChange = () => {
    // Re-fetch lead data after status update to get the latest info
    if (id) {
      fetchLead(id);
    }
    // Also revalidate the main page cache
    router.refresh();
  };

  if (loading || !lead) {
    return (
      <div className="flex flex-col gap-6">
        <div>
           <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Tutti i Lead
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
       <div>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Tutti i Lead
          </Link>
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl tracking-tight">{lead.name}</CardTitle>
            <CardDescription>
              Lead creato il{' '}
              {formatInTimeZone(parseISO(lead.createdAt), 'Europe/Rome', "d MMMM yyyy, HH:mm", {
                locale: it,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
              <div className="flex items-center gap-4">
                <StatusUpdater lead={lead} onStatusChange={handleStatusChange} />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <User className="size-4 shrink-0 text-muted-foreground" />
                <span>Assegnato a: <span className="font-medium">{lead.agent}</span></span>
              </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Phone className="size-4 shrink-0 text-muted-foreground" />
                    <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                <Car className="size-4 shrink-0 text-muted-foreground" />
                <span>Veicolo: <span className="font-medium">{lead.vehicleOfInterest}</span></span>
              </div>
               <div className="flex items-center gap-4 text-sm">
                <Tag className="size-4 shrink-0 text-muted-foreground" />
                <span>Targa: <span className="font-medium">{lead.plate}</span></span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Info className="size-4 shrink-0 text-muted-foreground" />
                <span>Tipo Intervento: <span className="font-medium">{lead.interventionType}</span></span>
              </div>
               <div className="flex items-center gap-4 text-sm">
                <Building className="size-4 shrink-0 text-muted-foreground" />
                <span>Sede: <span className="font-medium">{lead.location}</span></span>
              </div>
               <div className="flex items-center gap-4 text-sm">
                <Calendar className="size-4 shrink-0 text-muted-foreground" />
                <span>Data Preferita: <span className="font-medium">{lead.preferredDate}</span></span>
              </div>
               <div className="flex items-center gap-4 text-sm">
                <Clock className="size-4 shrink-0 text-muted-foreground" />
                <span>Orario Preferito: <span className="font-medium">{lead.preferredTime}</span></span>
              </div>
                <div className="flex items-center gap-4 text-sm">
                <Clock className="size-4 shrink-0 text-muted-foreground" />
                <span>Orario Ricontatto: <span className="font-medium">{lead.contactTime}</span></span>
              </div>
              {lead.notes && (
                 <div className="flex items-start gap-4 text-sm">
                    <NotebookText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <p className="whitespace-pre-wrap text-muted-foreground">{lead.notes}</p>
                 </div>
              )}
            </CardContent>
        </Card>
        <div>
          <OperatorNotesEditor 
            leadId={lead.id} 
            initialNotes={lead.operatorNotes || ''} 
            onSave={handleStatusChange}
          />
        </div>
      </div>
    </div>
  );
}
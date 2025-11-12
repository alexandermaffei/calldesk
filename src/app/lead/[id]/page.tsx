import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { ArrowLeft, Car, Mail, Phone, User, NotebookText, Tag, Clock, Calendar, Building, Info } from 'lucide-react';

import { getLeadById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/status-badge';
import EditLeadForm from '@/components/edit-lead-form';

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const lead = await getLeadById(params.id);

  if (!lead) {
    notFound();
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
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl tracking-tight">{lead.name}</CardTitle>
              <CardDescription>
                Lead creato il{' '}
                {format(parseISO(lead.createdAt), "d MMMM yyyy", {
                  locale: it,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
               <div className="flex items-center gap-4">
                <StatusBadge status={lead.status} />
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
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                 <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
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
                    <p className="text-muted-foreground">{lead.notes}</p>
                 </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <EditLeadForm lead={lead} />
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';
import { MoreHorizontal, Search, ListFilter } from 'lucide-react';
import type { Lead, LeadStatus } from '@/lib/definitions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusUpdater } from './status-updater';
import { LeadDetailDialog } from './lead-detail-dialog';
import RequestTypeBadge from './request-type-badge';
import { useAuth } from '@/contexts/auth-context';
import { getUserRole } from '@/lib/user-roles';

const STATUS_OPTIONS: LeadStatus[] = ['Da gestire', 'Gestita'];

export default function LeadsTable({ leads, title }: { leads: Lead[], title: string }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilters, setStatusFilters] = React.useState<LeadStatus[]>([]);
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { user } = useAuth();
  const userRole = getUserRole(user?.email || null);
  const isSales = userRole === 'sales';

  const filteredLeads = React.useMemo(() => {
    return leads.filter((lead) => {
      const searchMatch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.vehicleOfInterest.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.plate && lead.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lead.location.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch =
        statusFilters.length === 0 || statusFilters.includes(lead.status);

      return searchMatch && statusMatch;
    });
  }, [leads, searchTerm, statusFilters]);

  const handleStatusFilterChange = (status: LeadStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleRowClick = (leadId: string, e: React.MouseEvent) => {
    // Don't open dialog if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="button"]') ||
      target.closest('.dropdown-menu')
    ) {
      return;
    }
    setSelectedLeadId(leadId);
    setDialogOpen(true);
  };

  const handleStatusChange = () => {
    // Refresh the leads list if needed
    // This could trigger a refetch if you have that set up
  };

  // Ascolta eventi per aprire il dialog da notifiche desktop
  React.useEffect(() => {
    const handleOpenLeadDialog = (event: Event) => {
      const customEvent = event as CustomEvent<{ leadId: string }>;
      const { leadId } = customEvent.detail;
      if (leadId) {
        setSelectedLeadId(leadId);
        setDialogOpen(true);
      }
    };

    window.addEventListener('openLeadDialog', handleOpenLeadDialog);
    return () => {
      window.removeEventListener('openLeadDialog', handleOpenLeadDialog);
    };
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-2">
          <CardTitle>{title}</CardTitle>
          <div className="flex w-full flex-1 gap-2 sm:ml-auto sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cerca lead..."
                className="pl-8 sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <ListFilter className="size-3.5" />
                  <span className="hidden sm:inline">Filtra</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtra per stato</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {STATUS_OPTIONS.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilters.includes(status)}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={() => handleStatusFilterChange(status)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo Richiesta</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Richiesta</TableHead>
                <TableHead>Targa</TableHead>
                {!isSales && <TableHead>Tipo Intervento</TableHead>}
                <TableHead>Ricontatto</TableHead>
                <TableHead>Note Operatore</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Data Creazione</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow 
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={(e) => handleRowClick(lead.id, e)}
                >
                  <TableCell className="whitespace-normal break-words">
                    <div className="font-medium">{lead.name || ''}</div>
                    <div className="text-sm text-muted-foreground">
                      {lead.phone || ''}
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} className="whitespace-normal break-words">
                    <RequestTypeBadge requestType={lead.requestType} />
                  </TableCell>
                   <TableCell onClick={(e) => e.stopPropagation()} className="whitespace-normal break-words">
                     <StatusUpdater lead={lead} onStatusChange={handleStatusChange} />
                  </TableCell>
                  <TableCell className="max-w-[1200px] whitespace-normal break-words">{lead.notes || ''}</TableCell>
                  <TableCell className="whitespace-normal break-words">{lead.plate || ''}</TableCell>
                  {!isSales && <TableCell className="whitespace-normal break-words">{lead.interventionType || ''}</TableCell>}
                  <TableCell className="whitespace-normal break-words">{lead.contactTime || ''}</TableCell>
                  <TableCell className="max-w-[200px] whitespace-normal break-words">{lead.operatorNotes || ''}</TableCell>
                  <TableCell className="whitespace-normal break-words">{lead.location || ''}</TableCell>
                  <TableCell className="whitespace-nowrap min-w-[180px]">
                     {formatInTimeZone(parseISO(lead.createdAt), 'Europe/Rome', 'd MMMM yyyy, HH:mm', { 
                       locale: it
                     })}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setSelectedLeadId(lead.id);
                          setDialogOpen(true);
                        }}>
                          Vedi Dettagli
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredLeads.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Nessun lead trovato.
          </div>
        )}
      </CardContent>
      <LeadDetailDialog
        leadId={selectedLeadId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onStatusChange={handleStatusChange}
      />
    </Card>
  );
}

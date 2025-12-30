"use client";

import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
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
import { getColumnsForRole, shouldShowColumn, type ColumnConfig } from '@/lib/table-columns';

const STATUS_OPTIONS: LeadStatus[] = ['Da gestire', 'Gestita'];

export default function LeadsTable({ leads, title }: { leads: Lead[], title: string }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilters, setStatusFilters] = React.useState<LeadStatus[]>([]);
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { user } = useAuth();
  
  // Ottieni il ruolo utente e le colonne da mostrare
  const userRole = React.useMemo(() => getUserRole(user?.email || null), [user?.email]);
  const allAvailableColumns = React.useMemo(() => getColumnsForRole(userRole), [userRole]);

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

  // Determina quali colonne mostrare nell'header in base ai tipi di richiesta presenti
  const visibleColumns = React.useMemo(() => {
    if (filteredLeads.length === 0) {
      // Se non ci sono lead, mostra tutte le colonne sempre visibili
      return allAvailableColumns.filter(col => col.alwaysShow);
    }
    
    // Trova tutti i tipi di richiesta presenti nelle lead filtrate
    const requestTypes = new Set(filteredLeads.map(lead => lead.requestType).filter(Boolean));
    
    // Filtra le colonne: mostra sempre quelle alwaysShow, e quelle specifiche solo se c'è almeno una lead del tipo corrispondente
    return allAvailableColumns.filter(col => {
      if (col.alwaysShow) return true;
      if (!col.showForRequestTypes || col.showForRequestTypes.length === 0) return true;
      // Mostra la colonna se almeno una lead ha uno dei tipi di richiesta richiesti
      return Array.from(requestTypes).some(rt => col.showForRequestTypes?.includes(rt as 'SALES' | 'SERVICE' | 'PARTS'));
    });
  }, [allAvailableColumns, filteredLeads]);

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

  // Funzione per renderizzare il valore di una cella
  const renderCellValue = (column: ColumnConfig, lead: Lead): React.ReactNode => {
    switch (column.key) {
      case 'cliente':
        return (
          <>
            <div className="font-medium">{lead.name}</div>
            <div className="text-sm text-muted-foreground">{lead.phone}</div>
          </>
        );
      case 'tipoRichiesta':
        return <RequestTypeBadge requestType={lead.requestType} />;
      case 'stato':
        return <StatusUpdater lead={lead} onStatusChange={handleStatusChange} />;
      case 'data':
        return lead.requestDate !== 'N/A' 
          ? format(parseISO(lead.requestDate), 'd MMM yyyy', { locale: it })
          : 'N/A';
      case 'nomeCognome':
        return lead.name;
      case 'recapito':
        return lead.phone;
      case 'sede':
        return lead.location || 'N/A';
      case 'orarioRicontatto':
        return lead.contactTime || 'N/A';
      case 'dataPreferita':
        return lead.preferredDate || 'N/A';
      case 'orario':
        return lead.preferredTime ? (
          <span className="max-w-[200px] truncate block">{lead.preferredTime}</span>
        ) : 'N/A';
      case 'richiestaGenerica':
        return lead.notes ? (
          <span className="max-w-[250px] truncate block">{lead.notes.split(' - ')[0]}</span>
        ) : 'N/A';
      case 'richiestaSpecifica':
        const specifica = lead.notes.split(' - ')[1];
        return specifica ? (
          <span className="max-w-[250px] truncate block">{specifica}</span>
        ) : 'N/A';
      case 'altreSegnalazioni':
        return lead.altreSegnalazioni ? (
          <span className="max-w-[200px] truncate block">{lead.altreSegnalazioni}</span>
        ) : 'N/A';
      case 'feedback':
        return lead.feedback || 'N/A';
      case 'marcaModello':
        return lead.vehicleOfInterest || 'N/A';
      case 'targa':
        return lead.plate || 'N/A';
      case 'intestazione':
        return lead.intestazione || 'N/A';
      case 'tipoIntervento':
        return lead.interventionType || 'N/A';
      case 'kilometraggio':
        return lead.kilometraggio || 'N/A';
      case 'veicoloSostitutivo':
        return lead.veicoloSostitutivo || 'N/A';
      case 'pezzoDiRicambio':
        return lead.pezzoDiRicambio ? (
          <span className="max-w-[200px] truncate block">{lead.pezzoDiRicambio}</span>
        ) : 'N/A';
      case 'tipoRichiestaSales':
        return lead.tipoRichiestaSales ? (
          <span className="max-w-[200px] truncate block">{lead.tipoRichiestaSales}</span>
        ) : 'N/A';
      case 'provenienza':
        return lead.provenienza ? (
          <span className="max-w-[200px] truncate block">{lead.provenienza}</span>
        ) : 'N/A';
      case 'informazioniAuto':
        return lead.informazioniAuto ? (
          <span className="max-w-[200px] truncate block">{lead.informazioniAuto}</span>
        ) : 'N/A';
      case 'permuta':
        return lead.permuta || 'N/A';
      case 'pagamento':
        return lead.pagamento || 'N/A';
      case 'ragioneSociale':
        return lead.ragioneSociale ? (
          <span className="max-w-[200px] truncate block">{lead.ragioneSociale}</span>
        ) : 'N/A';
      case 'autoAlternativa':
        return lead.autoAlternativa ? (
          <span className="max-w-[200px] truncate block">{lead.autoAlternativa}</span>
        ) : 'N/A';
      case 'venditore':
        return lead.venditore || 'N/A';
      case 'cambio':
        return lead.cambio || 'N/A';
      case 'alimentazione':
        return lead.alimentazione || 'N/A';
      case 'sitoAnnuncio':
        return lead.sitoAnnuncio ? (
          <span className="max-w-[200px] truncate block">{lead.sitoAnnuncio}</span>
        ) : 'N/A';
      case 'noteOperatore':
        return lead.operatorNotes ? (
          <span className="max-w-[200px] truncate block">{lead.operatorNotes}</span>
        ) : 'N/A';
      case 'dataCreazione':
        return format(parseISO(lead.createdAt), 'd MMM yyyy', { locale: it });
      case 'azioni':
        return (
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
        );
      default:
        return 'N/A';
    }
  };
  
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
                {visibleColumns.map((column) => (
                  <TableHead key={column.key}>
                    {column.key === 'azioni' ? (
                      <span className="text-right block w-full">Azioni</span>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow 
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={(e) => handleRowClick(lead.id, e)}
                >
                  {visibleColumns.map((column) => {
                    // Controlla se la colonna deve essere mostrata per questa lead
                    const shouldShow = shouldShowColumn(column, lead.requestType);
                    
                    const isInteractive = column.key === 'stato' || column.key === 'tipoRichiesta' || column.key === 'azioni';
                    
                    return (
                      <TableCell
                        key={column.key}
                        onClick={isInteractive ? (e) => e.stopPropagation() : undefined}
                        className={column.key === 'azioni' ? 'text-right' : ''}
                      >
                        {shouldShow ? renderCellValue(column, lead) : '—'}
                      </TableCell>
                    );
                  })}
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

"use client";

import * as React from 'react';
import Link from 'next/link';
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
import StatusBadge from './status-badge';

const STATUS_OPTIONS: LeadStatus[] = ['Da contattare', 'Contattato', 'Contatto fallito, da ricontattare'];

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilters, setStatusFilters] = React.useState<LeadStatus[]>([]);

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
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-2">
          <CardTitle>Tutti i Lead</CardTitle>
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
                <TableHead>Stato</TableHead>
                <TableHead>Richiesta</TableHead>
                <TableHead>Veicolo</TableHead>
                <TableHead>Targa</TableHead>
                <TableHead>Tipo Intervento</TableHead>
                <TableHead>Ricontatto</TableHead>
                <TableHead>Data Pref.</TableHead>
                <TableHead>Orario Pref.</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Data Lead</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {lead.phone}
                    </div>
                  </TableCell>
                   <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate">{lead.notes}</TableCell>
                  <TableCell>{lead.vehicleOfInterest}</TableCell>
                  <TableCell>{lead.plate}</TableCell>
                  <TableCell>{lead.interventionType}</TableCell>
                  <TableCell>{lead.contactTime}</TableCell>
                  <TableCell>{lead.preferredDate}</TableCell>
                  <TableCell>{lead.preferredTime}</TableCell>
                  <TableCell>{lead.location}</TableCell>
                  <TableCell>
                    {format(parseISO(lead.createdAt), 'd MMM yyyy', { locale: it })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                           <Link href={`/lead/${lead.id}`}>Vedi / Modifica</Link>
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
    </Card>
  );
}

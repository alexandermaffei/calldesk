"use client";

import * as React from 'react';
import type { Lead, LeadStatus } from '@/lib/definitions';
import { updateLeadStatusAction } from '@/lib/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from './status-badge';
import { useToast } from '@/hooks/use-toast';

const STATUS_OPTIONS: LeadStatus[] = ['Da contattare', 'Contattato', 'Contatto fallito, da ricontattare'];

export function StatusUpdater({ lead, onStatusChange }: { lead: Lead, onStatusChange?: () => void }) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();

  const handleStatusChange = (newStatus: LeadStatus) => {
    startTransition(async () => {
      const result = await updateLeadStatusAction(lead.id, newStatus);
      if (result?.message.startsWith("Errore")) {
         toast({
          title: "Errore",
          description: result.message,
          variant: "destructive",
        });
      } else {
        // Status aggiornato senza mostrare toast
        if (onStatusChange) {
            onStatusChange();
        }
      }
    });
  };

  const availableStatuses = STATUS_OPTIONS.filter(s => s !== lead.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button disabled={isPending}>
           <StatusBadge status={lead.status} className="cursor-pointer hover:opacity-80 transition-opacity" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Cambia stato</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableStatuses.map((status) => (
          <DropdownMenuItem key={status} onSelect={() => handleStatusChange(status)}>
            {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

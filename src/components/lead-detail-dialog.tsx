"use client";

import { useState, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { Car, Mail, Phone, User, NotebookText, Tag, Clock, Calendar, Building, Info } from 'lucide-react';
import type { Lead } from '@/lib/definitions';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { StatusUpdater } from './status-updater';
import { OperatorNotesEditor, type OperatorNotesEditorRef } from './operator-notes-editor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface LeadDetailDialogProps {
  leadId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

export function LeadDetailDialog({ leadId, open, onOpenChange, onStatusChange }: LeadDetailDialogProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const notesEditorRef = useRef<OperatorNotesEditorRef>(null);

  const fetchLead = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leads/${id}`);
      if (!response.ok) {
        throw new Error('Errore nel recupero del lead');
      }
      const fetchedLead: Lead = await response.json();
      setLead(fetchedLead);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Errore nel recupero del lead:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && leadId) {
      fetchLead(leadId);
    } else if (!open) {
      setLead(null);
      setHasUnsavedChanges(false);
    }
  }, [open, leadId]);

  const handleStatusChange = () => {
    if (leadId) {
      fetchLead(leadId);
    }
    if (onStatusChange) {
      onStatusChange();
    }
  };

  const handleNotesChange = (hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasUnsavedChanges) {
      setPendingClose(true);
      setShowUnsavedDialog(true);
    } else {
      onOpenChange(newOpen);
    }
  };

  const handleSaveAndClose = async () => {
    try {
      if (notesEditorRef.current) {
        await notesEditorRef.current.save();
      }
      setShowUnsavedDialog(false);
      setPendingClose(false);
      setHasUnsavedChanges(false);
      onOpenChange(false);
    } catch (error) {
      // Error already handled in the editor
      // Don't close if save failed
    }
  };

  const handleDiscardAndClose = () => {
    setShowUnsavedDialog(false);
    setPendingClose(false);
    setHasUnsavedChanges(false);
    onOpenChange(false);
  };

  const handleCancelClose = () => {
    setShowUnsavedDialog(false);
    setPendingClose(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Dettagli Lead</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Caricamento...
            </div>
          ) : lead ? (
            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl tracking-tight">{lead.name}</CardTitle>
                  <CardDescription>
                    Lead creato il{' '}
                    {format(parseISO(lead.createdAt), "d MMMM yyyy, HH:mm", {
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
                      <p className="whitespace-pre-wrap text-muted-foreground">{lead.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <div>
                <OperatorNotesEditor 
                  ref={notesEditorRef}
                  leadId={lead.id} 
                  initialNotes={lead.operatorNotes || ''} 
                  onSave={handleStatusChange}
                  onNotesChange={handleNotesChange}
                />
              </div>
            </div>
          ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifiche non salvate</AlertDialogTitle>
            <AlertDialogDescription>
              Hai modificato le note operatore ma non le hai salvate. Vuoi salvarle prima di chiudere?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardAndClose}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Scarta modifiche
            </AlertDialogAction>
            <AlertDialogAction onClick={handleSaveAndClose}>
              Salva e chiudi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


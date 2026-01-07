"use client";

import { useState, useEffect, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { formatInTimeZone } from 'date-fns-tz';
import { Car, Phone, NotebookText, Tag, Clock, Calendar, Building, Info, CalendarCheck, Loader2, User, AlertCircle } from 'lucide-react';
import type { Lead } from '@/lib/definitions';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { StatusUpdater } from './status-updater';
import { OperatorNotesEditor, type OperatorNotesEditorRef } from './operator-notes-editor';
import { PitStopBookingDialog } from './pitstop-booking-dialog';
import { useAuth } from '@/contexts/auth-context';
import { getUserRole } from '@/lib/user-roles';
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
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const notesEditorRef = useRef<OperatorNotesEditorRef>(null);
  const { user } = useAuth();
  const userRole = getUserRole(user?.email || null);
  const canCreateBooking = userRole !== 'sales';

  const fetchLead = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leads/${id}`, {
        headers: {
          'x-user-email': user?.email || '',
        },
      });
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

  const handleCreatePitStopBooking = () => {
    setShowBookingDialog(true);
  };

  const handleBookingSuccess = () => {
    handleStatusChange();
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
                  <CardDescription className="space-y-1">
                    <div>
                      Lead creato il{' '}
                      {formatInTimeZone(parseISO(lead.createdAt), 'Europe/Rome', "d MMMM yyyy, HH:mm", {
                        locale: it,
                      })}
                    </div>
                    {lead.lastModified && (
                      <div>
                        Ultima modifica{' '}
                        {formatInTimeZone(parseISO(lead.lastModified), 'Europe/Rome', "d MMMM yyyy, HH:mm", {
                          locale: it,
                        })}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <StatusUpdater lead={lead} onStatusChange={handleStatusChange} />
                  </div>
                  {canCreateBooking && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        onClick={handleCreatePitStopBooking}
                        className="w-full bg-purple-600 text-white hover:bg-purple-700"
                      >
                        <CalendarCheck className="mr-2 size-4" />
                        Crea Prenotazione in Pit Stop
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <Phone className="size-4 shrink-0 text-muted-foreground" />
                    <a href={`tel:${lead.phone}`} className="hover:underline font-medium text-foreground">{lead.phone}</a>
                  </div>
                  {lead.notes && (
                    <div className="flex items-start gap-4 text-sm">
                      <NotebookText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Dettagli richiesta</div>
                        <p className="whitespace-pre-wrap text-foreground font-medium">{lead.notes}</p>
                      </div>
                    </div>
                  )}
                  {lead.vehicleOfInterest && (
                    <div className="flex items-center gap-4 text-sm">
                      <Car className="size-4 shrink-0 text-muted-foreground" />
                      <span>Veicolo: <span className="font-medium text-foreground">{lead.vehicleOfInterest}</span></span>
                    </div>
                  )}
                  {lead.plate && (
                    <div className="flex items-center gap-4 text-sm">
                      <Tag className="size-4 shrink-0 text-muted-foreground" />
                      <span>Targa: <span className="font-medium text-foreground">{lead.plate}</span></span>
                    </div>
                  )}
                  {lead.interventionType && userRole !== 'sales' && (
                    <div className="flex items-center gap-4 text-sm">
                      <Info className="size-4 shrink-0 text-muted-foreground" />
                      <span>Tipo Intervento: <span className="font-medium text-foreground">{lead.interventionType}</span></span>
                    </div>
                  )}
                  {lead.location && (
                    <div className="flex items-center gap-4 text-sm">
                      <Building className="size-4 shrink-0 text-muted-foreground" />
                      <span>Sede: <span className="font-medium text-foreground">{lead.location}</span></span>
                    </div>
                  )}
                  {lead.preferredDate && (
                    <div className="flex items-center gap-4 text-sm">
                      <Calendar className="size-4 shrink-0 text-muted-foreground" />
                      <span>Data Preferita: <span className="font-medium text-foreground">{lead.preferredDate}</span></span>
                    </div>
                  )}
                  {lead.preferredTime && (
                    <div className="flex items-center gap-4 text-sm">
                      <Clock className="size-4 shrink-0 text-muted-foreground" />
                      <span>Orario Preferito: <span className="font-medium text-foreground">{lead.preferredTime}</span></span>
                    </div>
                  )}
                  {lead.contactTime && (
                    <div className="flex items-center gap-4 text-sm">
                      <Clock className="size-4 shrink-0 text-muted-foreground" />
                      <span>Orario Ricontatto: <span className="font-medium text-foreground">{lead.contactTime}</span></span>
                    </div>
                  )}
                  {userRole === 'sales' && (
                    <>
                      {lead.informazioniAuto && (
                        <div className="flex items-center gap-4 text-sm">
                          <Car className="size-4 shrink-0 text-muted-foreground" />
                          <span>Informazioni Auto: <span className="font-medium text-foreground">{lead.informazioniAuto}</span></span>
                        </div>
                      )}
                      {lead.marca && (
                        <div className="flex items-center gap-4 text-sm">
                          <Tag className="size-4 shrink-0 text-muted-foreground" />
                          <span>Marca: <span className="font-medium text-foreground">{lead.marca}</span></span>
                        </div>
                      )}
                      {lead.permuta && (
                        <div className="flex items-center gap-4 text-sm">
                          <Info className="size-4 shrink-0 text-muted-foreground" />
                          <span>Permuta: <span className="font-medium text-foreground">{lead.permuta}</span></span>
                        </div>
                      )}
                      {lead.ragioneSociale && (
                        <div className="flex items-center gap-4 text-sm">
                          <Building className="size-4 shrink-0 text-muted-foreground" />
                          <span>Ragione Sociale: <span className="font-medium text-foreground">{lead.ragioneSociale}</span></span>
                        </div>
                      )}
                      {lead.pagamento && (
                        <div className="flex items-center gap-4 text-sm">
                          <Info className="size-4 shrink-0 text-muted-foreground" />
                          <span>Pagamento: <span className="font-medium text-foreground">{lead.pagamento}</span></span>
                        </div>
                      )}
                      {lead.venditore && (
                        <div className="flex items-center gap-4 text-sm">
                          <User className="size-4 shrink-0 text-muted-foreground" />
                          <span>Venditore: <span className="font-medium text-foreground">{lead.venditore}</span></span>
                        </div>
                      )}
                      {lead.cambio && (
                        <div className="flex items-center gap-4 text-sm">
                          <Info className="size-4 shrink-0 text-muted-foreground" />
                          <span>Cambio: <span className="font-medium text-foreground">{lead.cambio}</span></span>
                        </div>
                      )}
                      {lead.alimentazione && (
                        <div className="flex items-center gap-4 text-sm">
                          <Info className="size-4 shrink-0 text-muted-foreground" />
                          <span>Alimentazione: <span className="font-medium text-foreground">{lead.alimentazione}</span></span>
                        </div>
                      )}
                      {lead.sitoAnnuncio && (
                        <div className="flex items-center gap-4 text-sm">
                          <Info className="size-4 shrink-0 text-muted-foreground" />
                          <span>Sito Annuncio: <span className="font-medium text-foreground">{lead.sitoAnnuncio}</span></span>
                        </div>
                      )}
                      {lead.provenienza && (
                        <div className="flex items-center gap-4 text-sm">
                          <Building className="size-4 shrink-0 text-muted-foreground" />
                          <span>Provenienza: <span className="font-medium text-foreground">{lead.provenienza}</span></span>
                        </div>
                      )}
                      {lead.pezzoDiRicambio && (
                        <div className="flex items-center gap-4 text-sm">
                          <Info className="size-4 shrink-0 text-muted-foreground" />
                          <span>Pezzo di Ricambio: <span className="font-medium text-foreground">{lead.pezzoDiRicambio}</span></span>
                        </div>
                      )}
                      {lead.tipoRichiestaSales && (
                        <div className="flex items-center gap-4 text-sm">
                          <Tag className="size-4 shrink-0 text-muted-foreground" />
                          <span>Tipo Richiesta Sales: <span className="font-medium text-foreground">{lead.tipoRichiestaSales}</span></span>
                        </div>
                      )}
                      {lead.error && (
                        <div className="flex items-start gap-4 text-sm">
                          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                          <span>Error: <span className="font-medium text-foreground">{lead.error}</span></span>
                        </div>
                      )}
                      {lead.bodyPreview && (
                        <div className="flex items-start gap-4 text-sm">
                          <NotebookText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Body Preview</div>
                            <p className="whitespace-pre-wrap text-foreground">{lead.bodyPreview}</p>
                          </div>
                        </div>
                      )}
                      {lead.message && (
                        <div className="flex items-start gap-4 text-sm">
                          <NotebookText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Message</div>
                            <p className="whitespace-pre-wrap text-foreground">{lead.message}</p>
                          </div>
                        </div>
                      )}
                    </>
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

      <PitStopBookingDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        lead={lead}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
}


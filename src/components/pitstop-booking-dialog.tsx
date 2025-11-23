"use client";

import { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarIcon, Loader2, Search } from 'lucide-react';
import type { Lead } from '@/lib/definitions';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

interface PitStopBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onSuccess?: () => void;
}

const DEPOSITI = [
  { value: 'DEP1_MATERA', label: 'Matera' },
  { value: 'DEP2_POTENZA', label: 'Potenza' },
  { value: 'DEP3_ALTAMURA', label: 'Altamura' },
];

const TIPI_PRENOTAZIONE = [
  { value: 'Tagliando', label: 'Tagliando' },
  { value: 'Meccanica', label: 'Meccanica' },
  { value: 'Elettrauto', label: 'Elettrauto' },
  { value: 'Diagnosi', label: 'Diagnosi' },
  { value: 'Altro', label: 'Altro' },
];

const ORARI = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

// Mappa sedi CallDesk a depositi Pit Stop
const sedeToDeposito: Record<string, string> = {
  'Altamura': 'DEP3_ALTAMURA',
  'Matera': 'DEP1_MATERA',
  'Potenza': 'DEP2_POTENZA',
};

// Mappa tipi intervento CallDesk a tipi prenotazione Pit Stop
const interventionTypeToTipoPrenotazione: Record<string, string> = {
  'TAGLIANDO': 'Tagliando',
  'MECCANICA': 'Meccanica',
  'ELETTRAUTO': 'Elettrauto',
  'DIAGNOSI': 'Diagnosi',
  'N/A': 'Meccanica',
};

// Estrae prefisso e numero da un numero di telefono
function parsePhoneNumber(phone: string): { prefix: string; number: string } {
  const cleaned = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+39')) {
    return { prefix: '+39', number: cleaned.substring(3) };
  }
  
  if (cleaned.startsWith('39')) {
    return { prefix: '+39', number: cleaned.substring(2) };
  }
  
  const plusIndex = cleaned.indexOf('+');
  if (plusIndex === 0) {
    const match = cleaned.match(/^\+(\d{1,3})(\d+)$/);
    if (match) {
      return { prefix: `+${match[1]}`, number: match[2] };
    }
  }
  
  return { prefix: '+39', number: cleaned.replace(/^\+?39/, '') };
}

export function PitStopBookingDialog({ open, onOpenChange, lead, onSuccess }: PitStopBookingDialogProps) {
  const [deposito, setDeposito] = useState<string>('');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [nominativo, setNominativo] = useState<string>('');
  const [phonePrefix, setPhonePrefix] = useState<string>('+39');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [tipoPrenotazione, setTipoPrenotazione] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<Date | undefined>(undefined);
  const [orario, setOrario] = useState<string>('');
  const [extraReminderTime, setExtraReminderTime] = useState<boolean>(false);
  const [veicoloInSede, setVeicoloInSede] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Pre-compila i campi quando la lead cambia
  useEffect(() => {
    if (lead && open) {
      // Deposito
      const defaultDeposito = sedeToDeposito[lead.location] || 'DEP1_MATERA';
      setDeposito(defaultDeposito);
      
      // Targa
      setLicensePlate(lead.plate !== 'N/A' ? lead.plate : '');
      
      // Nominativo
      setNominativo(lead.name || '');
      
      // Telefono
      const { prefix, number } = parsePhoneNumber(lead.phone);
      setPhonePrefix(prefix);
      setPhoneNumber(number);
      
      // Tipo prenotazione
      const defaultTipo = interventionTypeToTipoPrenotazione[lead.interventionType] || 'Meccanica';
      setTipoPrenotazione(defaultTipo);
      
      // Data e ora
      try {
        if (lead.preferredDate && lead.preferredDate !== 'N/A') {
          // Prova a parsare la data
          let date: Date;
          
          // Rimuovi giorno della settimana se presente
          const cleanedDate = lead.preferredDate.replace(/^(lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)\s+/i, '');
          
          try {
            date = parse(cleanedDate, 'd MMMM yyyy', new Date(), { locale: it });
            
            if (isNaN(date.getTime())) {
              date = new Date(cleanedDate);
            }
          } catch {
            date = new Date(cleanedDate);
          }
          
          if (!isNaN(date.getTime())) {
            setBookingDate(date);
          } else {
            // Default: domani
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setBookingDate(tomorrow);
          }
        } else {
          // Default: domani
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          setBookingDate(tomorrow);
        }
        
        // Orario
        if (lead.preferredTime && lead.preferredTime !== 'N/A') {
          const timeMatch = lead.preferredTime.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            setOrario(lead.preferredTime);
          } else {
            setOrario('10:00');
          }
        } else {
          setOrario('10:00');
        }
      } catch {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setBookingDate(tomorrow);
        setOrario('10:00');
      }
      
      // Reset toggle
      setExtraReminderTime(false);
      setVeicoloInSede(false);
    }
  }, [lead, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nominativo.trim()) {
      toast({
        title: "Errore",
        description: "Il nominativo è obbligatorio.",
        variant: "destructive",
      });
      return;
    }
    
    if (!licensePlate.trim() || licensePlate.length < 5) {
      toast({
        title: "Errore",
        description: "La targa è obbligatoria e deve avere almeno 5 caratteri.",
        variant: "destructive",
      });
      return;
    }
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Errore",
        description: "Il numero di telefono è obbligatorio.",
        variant: "destructive",
      });
      return;
    }
    
    if (!bookingDate) {
      toast({
        title: "Errore",
        description: "La data prenotazione è obbligatoria.",
        variant: "destructive",
      });
      return;
    }
    
    if (!orario) {
      toast({
        title: "Errore",
        description: "L'orario è obbligatorio.",
        variant: "destructive",
      });
      return;
    }
    
    if (!deposito) {
      toast({
        title: "Errore",
        description: "La sede è obbligatoria.",
        variant: "destructive",
      });
      return;
    }
    
    if (!tipoPrenotazione) {
      toast({
        title: "Errore",
        description: "Il tipo prenotazione è obbligatorio.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Combina data e ora
      const bookingDateTime = new Date(bookingDate);
      const [hours, minutes] = orario.split(':').map(Number);
      bookingDateTime.setHours(hours, minutes, 0, 0);
      
      const response = await fetch('/api/pitstop/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead?.id,
          bookingData: {
            licensePlate: licensePlate.trim().toUpperCase(),
            nominativo: nominativo.trim(),
            customerPhonePrefix: phonePrefix,
            customerPhone: phoneNumber.trim(),
            bookingDate: bookingDateTime.toISOString(),
            deposito,
            tipoPrenotazione,
            createdBy: user?.email || 'CallDesk',
            extraReminderTime: extraReminderTime ? 'Sì' : 'No',
            statoNotifica: veicoloInSede ? 'Non inviare' : 'Da inviare',
          },
        }),
      });

      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Errore del server: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Errore durante la creazione della prenotazione');
      }

      toast({
        title: "Prenotazione creata",
        description: "La prenotazione è stata creata con successo in Pit Stop.",
      });
      
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Errore nella creazione prenotazione Pit Stop:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile creare la prenotazione in Pit Stop. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuova Prenotazione</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli del veicolo, del cliente e della sede.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Sede */}
            <div className="space-y-2">
              <Label htmlFor="deposito">Sede</Label>
              <Select value={deposito} onValueChange={setDeposito} required>
                <SelectTrigger id="deposito">
                  <SelectValue placeholder="Seleziona una sede" />
                </SelectTrigger>
                <SelectContent>
                  {DEPOSITI.map((dep) => (
                    <SelectItem key={dep.value} value={dep.value}>
                      {dep.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Targa */}
            <div className="space-y-2">
              <Label htmlFor="licensePlate">Targa</Label>
              <div className="relative">
                <Input
                  id="licensePlate"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  placeholder="AB123CD"
                  className="pr-10"
                  required
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              </div>
            </div>

            {/* Nominativo */}
            <div className="space-y-2">
              <Label htmlFor="nominativo">Nominativo</Label>
              <Input
                id="nominativo"
                value={nominativo}
                onChange={(e) => setNominativo(e.target.value)}
                placeholder="Mario Rossi"
                required
              />
            </div>

            {/* Prefisso e Telefono */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phonePrefix">Prefisso</Label>
                <Input
                  id="phonePrefix"
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                  placeholder="+39"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Telefono Cliente</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="3331234567"
                  required
                />
              </div>
            </div>

            {/* Tipo Prenotazione */}
            <div className="space-y-2">
              <Label htmlFor="tipoPrenotazione">Tipo Prenotazione</Label>
              <Select value={tipoPrenotazione} onValueChange={setTipoPrenotazione} required>
                <SelectTrigger id="tipoPrenotazione">
                  <SelectValue placeholder="Seleziona il tipo di intervento" />
                </SelectTrigger>
                <SelectContent>
                  {TIPI_PRENOTAZIONE.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Prenotazione */}
            <div className="space-y-2">
              <Label htmlFor="bookingDate">Data Prenotazione</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="bookingDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !bookingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {bookingDate ? format(bookingDate, "PPP", { locale: it }) : "Scegli una data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={bookingDate}
                    onSelect={setBookingDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Orario */}
            <div className="space-y-2">
              <Label htmlFor="orario">Orario</Label>
              <Select value={orario} onValueChange={setOrario} required>
                <SelectTrigger id="orario">
                  <SelectValue placeholder="Seleziona un orario" />
                </SelectTrigger>
                <SelectContent>
                  {ORARI.map((ora) => (
                    <SelectItem key={ora} value={ora}>
                      {ora}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Toggle Avviso consegna anticipata */}
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="extraReminder" className="text-base">
                  Avviso consegna anticipata (2 giorni prima)
                </Label>
              </div>
              <Switch
                id="extraReminder"
                checked={extraReminderTime}
                onCheckedChange={setExtraReminderTime}
              />
            </div>

            {/* Toggle Veicolo già presente */}
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="veicoloInSede" className="text-base">
                  Veicolo già presente in sede
                </Label>
              </div>
              <Switch
                id="veicoloInSede"
                checked={veicoloInSede}
                onCheckedChange={setVeicoloInSede}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 text-white hover:bg-purple-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creazione in corso...
                </>
              ) : (
                'Aggiungi Prenotazione'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


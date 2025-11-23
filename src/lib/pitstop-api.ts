import type { Lead } from './definitions';
import { parse } from 'date-fns';
import { it } from 'date-fns/locale';

const PITSTOP_API_URL = process.env.NEXT_PUBLIC_PITSTOP_API_URL || 'https://studio--pit-stop-ins2t.us-central1.hosted.app/api/bookings';
const PITSTOP_API_KEY = process.env.PITSTOP_API_KEY || 'Anime7-Rejoice1-Karaoke9-Catering5-Poking8-Snort4-Oboe5';

// Mappa le sedi di CallDesk ai depositi Pit Stop
const sedeToDeposito: Record<string, string> = {
  'Altamura': 'DEP3_ALTAMURA',
  'Matera': 'DEP1_MATERA',
  'Potenza': 'DEP2_POTENZA',
  // Aggiungi altre mappature se necessario
};

// Mappa i tipi di intervento di CallDesk ai tipi prenotazione Pit Stop
const interventionTypeToTipoPrenotazione: Record<string, string> = {
  'TAGLIANDO': 'Tagliando',
  'MECCANICA': 'Meccanica',
  'ELETTRAUTO': 'Elettrauto',
  'DIAGNOSI': 'Diagnosi',
  // Default per altri tipi
  'N/A': 'Meccanica',
};

// Estrae prefisso e numero da un numero di telefono
function parsePhoneNumber(phone: string): { prefix: string; number: string } {
  // Rimuovi spazi e caratteri speciali
  const cleaned = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  // Se inizia con +39, estrai prefisso
  if (cleaned.startsWith('+39')) {
    return {
      prefix: '+39',
      number: cleaned.substring(3),
    };
  }
  
  // Se inizia con 39, estrai prefisso
  if (cleaned.startsWith('39')) {
    return {
      prefix: '+39',
      number: cleaned.substring(2),
    };
  }
  
  // Se inizia con +, prova a estrarre prefisso (es. +44)
  const plusIndex = cleaned.indexOf('+');
  if (plusIndex === 0) {
    // Cerca il primo numero dopo il +
    const match = cleaned.match(/^\+(\d{1,3})(\d+)$/);
    if (match) {
      return {
        prefix: `+${match[1]}`,
        number: match[2],
      };
    }
  }
  
  // Default: assume +39 per numeri italiani
  return {
    prefix: '+39',
    number: cleaned.replace(/^\+?39/, ''),
  };
}

// Converte data e ora preferita in formato ISO 8601
function formatBookingDate(preferredDate: string, preferredTime: string): string {
  try {
    let date: Date;
    
    if (preferredDate === 'N/A' || !preferredDate) {
      // Se non c'è data, usa domani alle 10:00
      date = new Date();
      date.setDate(date.getDate() + 1);
      date.setHours(10, 0, 0, 0);
    } else {
      // Prova a parsare la data in vari formati
      // Prima prova come ISO string
      date = new Date(preferredDate);
      
      // Se non è valida, prova a parsare formato italiano (es. "lunedì 27 ottobre 2025")
      if (isNaN(date.getTime())) {
        // Rimuovi il giorno della settimana se presente
        const cleanedDate = preferredDate.replace(/^(lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica)\s+/i, '');
        
        // Prova a parsare con date-fns
        try {
          date = parse(cleanedDate, 'd MMMM yyyy', new Date(), { locale: it });
          
          if (isNaN(date.getTime())) {
            // Fallback: prova formato semplice
            date = new Date(cleanedDate);
          }
        } catch {
          // Se date-fns non funziona, usa new Date
          date = new Date(cleanedDate);
        }
        
        // Se ancora non valida, usa domani
        if (isNaN(date.getTime())) {
          date = new Date();
          date.setDate(date.getDate() + 1);
        }
      }
    }
    
    // Se c'è un orario, parsalo
    if (preferredTime && preferredTime !== 'N/A') {
      const timeMatch = preferredTime.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        date.setHours(hours, minutes, 0, 0);
      } else {
        // Default: 10:00
        date.setHours(10, 0, 0, 0);
      }
    } else {
      // Default: 10:00
      date.setHours(10, 0, 0, 0);
    }
    
    return date.toISOString();
  } catch (error) {
    // Fallback: usa domani alle 10:00
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 1);
    defaultDate.setHours(10, 0, 0, 0);
    return defaultDate.toISOString();
  }
}

export interface PitStopBookingData {
  licensePlate: string;
  nominativo: string;
  customerPhonePrefix: string;
  customerPhone: string;
  bookingDate: string;
  deposito: string;
  tipoPrenotazione: string;
  createdBy: string;
  extraReminderTime?: string;
  statoNotifica?: string;
}

export function mapLeadToPitStopBooking(lead: Lead, createdBy: string = 'CallDesk'): PitStopBookingData {
  const { prefix, number } = parsePhoneNumber(lead.phone);
  const deposito = sedeToDeposito[lead.location] || 'DEP1_MATERA'; // Default a Matera
  const tipoPrenotazione = interventionTypeToTipoPrenotazione[lead.interventionType] || 'Meccanica';
  
  return {
    licensePlate: lead.plate !== 'N/A' ? lead.plate : '',
    nominativo: lead.name,
    customerPhonePrefix: prefix,
    customerPhone: number,
    bookingDate: formatBookingDate(lead.preferredDate, lead.preferredTime),
    deposito,
    tipoPrenotazione,
    createdBy,
    extraReminderTime: 'No',
    statoNotifica: 'Da inviare',
  };
}

export async function createPitStopBooking(bookingData: PitStopBookingData): Promise<any> {
  console.log('Invio richiesta a Pit Stop API:', {
    url: PITSTOP_API_URL,
    method: 'POST',
    hasApiKey: !!PITSTOP_API_KEY,
    bookingData: {
      ...bookingData,
      // Non loggare dati sensibili completi
      licensePlate: bookingData.licensePlate,
      deposito: bookingData.deposito,
    },
  });

  const response = await fetch(PITSTOP_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PITSTOP_API_KEY}`,
    },
    body: JSON.stringify(bookingData),
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  console.log('Risposta Pit Stop API:', {
    status: response.status,
    statusText: response.statusText,
    contentType,
    isJson,
    url: response.url,
  });

  if (!response.ok) {
    let errorMessage = `Errore API Pit Stop: ${response.status} ${response.statusText}`;
    let errorDetails = '';
    
    if (isJson) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = JSON.stringify(errorData);
      } catch {
        // Se il parsing JSON fallisce, usa il messaggio di default
      }
    } else {
      // Se la risposta non è JSON, prova a leggere il testo
      try {
        const text = await response.text();
        errorDetails = text.substring(0, 500); // Limita a 500 caratteri
        
        // Se il testo è HTML, prova a estrarre informazioni utili
        if (text.includes('<html>')) {
          // Cerca titoli o messaggi di errore nell'HTML
          const titleMatch = text.match(/<title>(.*?)<\/title>/i);
          const h1Match = text.match(/<h1[^>]*>(.*?)<\/h1>/i);
          
          if (titleMatch) {
            errorMessage = `Errore API Pit Stop: ${response.status} - ${titleMatch[1]}`;
          } else if (h1Match) {
            errorMessage = `Errore API Pit Stop: ${response.status} - ${h1Match[1]}`;
          } else {
            errorMessage = `Errore API Pit Stop: ${response.status} - Il server ha restituito una pagina HTML invece di JSON`;
          }
        } else {
          errorMessage = `Errore API Pit Stop: ${response.status} - ${text.substring(0, 200)}`;
        }
      } catch {
        // Se anche il testo non può essere letto, usa il messaggio di default
      }
    }
    
    console.error('Dettagli errore Pit Stop API:', {
      errorMessage,
      errorDetails,
      status: response.status,
    });
    
    throw new Error(errorMessage);
  }

  if (!isJson) {
    const text = await response.text();
    console.error('Risposta Pit Stop API non è JSON:', {
      contentType,
      textPreview: text.substring(0, 500),
    });
    
    // Prova a estrarre informazioni dall'HTML
    let htmlMessage = 'Risposta non valida dal server';
    if (text.includes('<html>')) {
      const titleMatch = text.match(/<title>(.*?)<\/title>/i);
      if (titleMatch) {
        htmlMessage = titleMatch[1];
      }
    }
    
    throw new Error(`Risposta non valida dal server Pit Stop: atteso JSON, ricevuto ${contentType || 'text/html'}. ${htmlMessage}`);
  }

  return await response.json();
}


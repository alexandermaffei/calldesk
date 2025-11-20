import { NextRequest } from 'next/server';
import { getLeads } from '@/lib/data';

// Store per tenere traccia delle lead già notificate (in memoria, si resetta al riavvio)
// In produzione potresti usare Redis o un database
const notifiedLeadIds = new Set<string>();
let initialized = false;

// Inizializza con le lead esistenti per evitare notifiche su lead vecchie
async function initializeNotifiedLeads() {
  if (initialized) return;
  
  try {
    const leads = await getLeads();
    // Aggiungi tutte le lead esistenti al Set (così non verranno notificate)
    leads.forEach(lead => notifiedLeadIds.add(lead.id));
    initialized = true;
    console.log(`Inizializzate ${leads.length} lead esistenti per le notifiche`);
  } catch (error) {
    console.error('Errore nell\'inizializzazione lead notificate:', error);
  }
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  // Crea uno stream per Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      // Inizializza con le lead esistenti
      await initializeNotifiedLeads();
      
      // Invia un messaggio di connessione
      send(JSON.stringify({ type: 'connected', message: 'Connesso al servizio notifiche' }));

      // Funzione per controllare nuove lead
      const checkForNewLeads = async () => {
        try {
          const leads = await getLeads();
          
          // Ordina per data di creazione (più recenti prima)
          const sortedLeads = leads.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          // Controlla le prime 10 lead più recenti per nuove aggiunte
          for (const lead of sortedLeads.slice(0, 10)) {
            if (!notifiedLeadIds.has(lead.id)) {
              // Nuova lead trovata!
              notifiedLeadIds.add(lead.id);
              
              send(JSON.stringify({
                type: 'new_lead',
                lead: {
                  id: lead.id,
                  name: lead.name,
                  phone: lead.phone,
                  vehicleOfInterest: lead.vehicleOfInterest,
                  interventionType: lead.interventionType,
                  location: lead.location,
                }
              }));
            }
          }
        } catch (error) {
          console.error('Errore nel controllo nuove lead:', error);
          send(JSON.stringify({ 
            type: 'error', 
            message: 'Errore nel controllo nuove lead' 
          }));
        }
      };

      // Controlla immediatamente
      await checkForNewLeads();

      // Poi controlla ogni 20 secondi (Make.com fa parsing ogni 15 minuti, 
      // ma controlliamo più spesso per essere reattivi)
      const interval = setInterval(checkForNewLeads, 20000);

      // Cleanup quando la connessione si chiude
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}


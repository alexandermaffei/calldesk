import { NextRequest, NextResponse } from 'next/server';
import { getLeads, getAllLeads } from '@/lib/data';
import { getAllowedRequestTypes } from '@/lib/user-roles';
import type { LeadStatus } from '@/lib/definitions';

export async function GET(request: NextRequest) {
  try {
    // Ottieni l'email dall'header o query param
    const userEmail = request.headers.get('x-user-email') || 
                     request.nextUrl.searchParams.get('email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email utente non fornita' },
        { status: 400 }
      );
    }

    // Ottieni i tipi di richiesta permessi per questo utente
    const allowedRequestTypes = getAllowedRequestTypes(userEmail);
    
    // Ottieni i parametri di filtro dalla query
    const status = request.nextUrl.searchParams.get('status') as LeadStatus | null;
    const view = request.nextUrl.searchParams.get('view') || 'all';

    let leads: any[];
    
    if (view === 'all') {
      leads = await getAllLeads(allowedRequestTypes || undefined);
    } else {
      leads = await getLeads(status || undefined, allowedRequestTypes || undefined);
    }

    // Se l'utente è admin (allowedRequestTypes è null), restituisci tutti i lead
    // Altrimenti filtra anche lato server per sicurezza aggiuntiva
    const filteredLeads = allowedRequestTypes === null 
      ? leads 
      : leads.filter(lead => 
          !lead.requestType || allowedRequestTypes.includes(lead.requestType)
        );

    // Log per debug (rimuovere in produzione)
    if (status === 'Da gestire') {
      console.log(`[DEBUG] Lead "Da gestire" - Utente: ${userEmail}, Ruolo: ${allowedRequestTypes === null ? 'admin' : allowedRequestTypes?.join(',')}, Totale recuperate: ${leads.length}, Filtrate: ${filteredLeads.length}`);
    }

    return NextResponse.json(filteredLeads);
  } catch (error) {
    console.error('Errore nel recupero dei lead:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei lead' },
      { status: 500 }
    );
  }
}


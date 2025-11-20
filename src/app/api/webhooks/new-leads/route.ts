import { NextRequest, NextResponse } from 'next/server';
import { getLeads } from '@/lib/data';

// Store per tenere traccia delle lead già notificate
// In produzione usa Redis o un database
const notifiedLeadIds = new Set<string>();

// Inizializza con le lead esistenti
let initialized = false;
async function initializeNotifiedLeads() {
  if (initialized) return;
  
  try {
    const leads = await getLeads();
    leads.forEach(lead => notifiedLeadIds.add(lead.id));
    initialized = true;
  } catch (error) {
    console.error('Errore nell\'inizializzazione:', error);
  }
}

// Endpoint webhook che Make.com può chiamare quando aggiunge nuove lead
export async function POST(request: NextRequest) {
  try {
    await initializeNotifiedLeads();
    
    // Make.com può inviare un array di ID delle nuove lead aggiunte
    const body = await request.json();
    const newLeadIds = body.leadIds || [];
    
    if (!Array.isArray(newLeadIds) || newLeadIds.length === 0) {
      return NextResponse.json(
        { error: 'leadIds deve essere un array non vuoto' },
        { status: 400 }
      );
    }

    // Ottieni i dettagli delle nuove lead
    const allLeads = await getLeads();
    const newLeads = allLeads.filter(lead => 
      newLeadIds.includes(lead.id) && !notifiedLeadIds.has(lead.id)
    );

    // Marca come notificate
    newLeads.forEach(lead => notifiedLeadIds.add(lead.id));

    // Invia notifiche tramite SSE (se ci sono client connessi)
    // Nota: questo richiede un sistema di broadcasting più sofisticato
    // Per ora, il polling SSE gestirà le notifiche

    return NextResponse.json({ 
      success: true, 
      notified: newLeads.length,
      message: `${newLeads.length} nuove lead saranno notificate` 
    });
  } catch (error) {
    console.error('Errore nel webhook:', error);
    return NextResponse.json(
      { error: 'Errore nel processamento del webhook' },
      { status: 500 }
    );
  }
}

// Endpoint GET per verificare lo stato
export async function GET() {
  await initializeNotifiedLeads();
  return NextResponse.json({
    initialized,
    notifiedCount: notifiedLeadIds.size,
  });
}


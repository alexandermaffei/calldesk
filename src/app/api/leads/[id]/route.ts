import { NextRequest, NextResponse } from 'next/server';
import { getLeadById } from '@/lib/data';
import { getAllowedRequestTypes } from '@/lib/user-roles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lead = await getLeadById(id);
    
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead non trovato' },
        { status: 404 }
      );
    }

    // Verifica i permessi dell'utente
    const userEmail = request.headers.get('x-user-email') || 
                     request.nextUrl.searchParams.get('email');
    
    if (userEmail) {
      const allowedRequestTypes = getAllowedRequestTypes(userEmail);
      
      // Se l'utente non è admin e la lead ha un TipoRichiesta, verifica i permessi
      if (allowedRequestTypes !== null && lead.requestType) {
        if (!allowedRequestTypes.includes(lead.requestType)) {
          return NextResponse.json(
            { error: 'Accesso negato a questa lead' },
            { status: 403 }
          );
        }
      }
    }
    
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Errore nel recupero del lead:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del lead' },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';
import { getLeadById } from '@/lib/data';
import { getAllowedRequestTypes } from '@/lib/user-roles';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userEmail = request.headers.get('x-user-email');

    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lead = await getLeadById(id);
    
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead non trovato' },
        { status: 404 }
      );
    }

    // Implement role-based access control for single lead
    const allowedRequestTypes = getAllowedRequestTypes(userEmail);
    if (allowedRequestTypes !== null && (!lead.requestType || !allowedRequestTypes.includes(lead.requestType))) {
      return NextResponse.json({ error: 'Accesso negato a questa lead' }, { status: 403 });
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


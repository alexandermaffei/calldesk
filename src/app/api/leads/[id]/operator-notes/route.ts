import { NextResponse } from 'next/server';
import { updateLead } from '@/lib/data';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { operatorNotes } = body;

    if (typeof operatorNotes !== 'string') {
      return NextResponse.json(
        { error: 'operatorNotes deve essere una stringa' },
        { status: 400 }
      );
    }

    const updatedLead = await updateLead(id, { operatorNotes });
    
    if (!updatedLead) {
      return NextResponse.json(
        { error: 'Lead non trovato' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle note operatore:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento delle note operatore' },
      { status: 500 }
    );
  }
}


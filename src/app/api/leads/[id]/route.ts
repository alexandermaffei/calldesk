import { NextResponse } from 'next/server';
import { getLeadById } from '@/lib/data';

export async function GET(
  request: Request,
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
    
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Errore nel recupero del lead:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero del lead' },
      { status: 500 }
    );
  }
}


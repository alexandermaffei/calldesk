import { NextRequest, NextResponse } from 'next/server';
import { createPitStopBooking, type PitStopBookingData } from '@/lib/pitstop-api';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Body della richiesta non valido. JSON atteso.' },
        { status: 400 }
      );
    }
    
    const { bookingData } = body;

    if (!bookingData) {
      return NextResponse.json(
        { error: 'bookingData è obbligatorio' },
        { status: 400 }
      );
    }

    // Valida i dati obbligatori
    if (!bookingData.licensePlate || bookingData.licensePlate.length < 5) {
      return NextResponse.json(
        { error: 'La targa è obbligatoria e deve avere almeno 5 caratteri' },
        { status: 400 }
      );
    }

    if (!bookingData.nominativo || !bookingData.nominativo.trim()) {
      return NextResponse.json(
        { error: 'Il nominativo è obbligatorio' },
        { status: 400 }
      );
    }

    if (!bookingData.customerPhone || !bookingData.customerPhone.trim()) {
      return NextResponse.json(
        { error: 'Il numero di telefono è obbligatorio' },
        { status: 400 }
      );
    }

    if (!bookingData.bookingDate) {
      return NextResponse.json(
        { error: 'La data prenotazione è obbligatoria' },
        { status: 400 }
      );
    }

    if (!bookingData.deposito) {
      return NextResponse.json(
        { error: 'La sede è obbligatoria' },
        { status: 400 }
      );
    }

    if (!bookingData.tipoPrenotazione) {
      return NextResponse.json(
        { error: 'Il tipo prenotazione è obbligatorio' },
        { status: 400 }
      );
    }

    // Crea la prenotazione in Pit Stop
    const result = await createPitStopBooking(bookingData as PitStopBookingData);

    return NextResponse.json({
      success: true,
      booking: result,
      message: 'Prenotazione creata con successo in Pit Stop',
    });
  } catch (error: any) {
    console.error('Errore nella creazione prenotazione Pit Stop:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Errore durante la creazione della prenotazione',
        details: error.message,
      },
      { status: 500 }
    );
  }
}


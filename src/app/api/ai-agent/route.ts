import { NextResponse } from 'next/server';

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || 'https://hook.eu2.make.com/rwq2wb22gxx3guhbb36v3spa65ido155';
const MAKE_API_KEY = process.env.MAKE_API_KEY;

export async function POST(request: Request) {
  if (!MAKE_API_KEY) {
    return NextResponse.json(
      { error: 'API key non configurata' },
      { status: 500 }
    );
  }

  try {
    // Recupera l'email dell'utente dalla richiesta
    const body = await request.json();
    const userEmail = body.userEmail || null;
    
    // Prepara il payload da inviare al webhook
    const payload = {
      timestamp: new Date().toISOString(),
      userEmail: userEmail,
    };

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'x-make-apikey': MAKE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Make.com API error: ${response.statusText}`);
    }

    const textResponse = await response.text();
    return NextResponse.json({ response: textResponse });
  } catch (error) {
    console.error('Errore durante la chiamata a Make.com:', error);
    return NextResponse.json(
      { error: 'Impossibile contattare l\'agente AI' },
      { status: 500 }
    );
  }
}


import { NextResponse } from 'next/server';

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || 'https://hook.eu2.make.com/rwq2wb22gxx3guhbb36v3spa65ido155';
const MAKE_API_KEY = process.env.MAKE_API_KEY;

export async function POST() {
  if (!MAKE_API_KEY) {
    return NextResponse.json(
      { error: 'API key non configurata' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'x-make-apikey': MAKE_API_KEY,
      },
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


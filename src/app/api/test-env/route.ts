import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY 
      ? `${process.env.AIRTABLE_API_KEY.substring(0, 10)}...` 
      : '❌ NON CONFIGURATA',
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID || '❌ NON CONFIGURATA (usando default)',
    MAKE_API_KEY: process.env.MAKE_API_KEY 
      ? `${process.env.MAKE_API_KEY.substring(0, 10)}...` 
      : '❌ NON CONFIGURATA',
    MAKE_WEBHOOK_URL: process.env.MAKE_WEBHOOK_URL || '❌ NON CONFIGURATA (usando default)',
  };

  return NextResponse.json({
    message: 'Verifica variabili d\'ambiente',
    env: envCheck,
    timestamp: new Date().toISOString(),
  });
}


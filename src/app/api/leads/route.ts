import { NextRequest, NextResponse } from 'next/server';
import { getLeads, getAllLeads } from '@/lib/data';
import { getAllowedRequestTypes } from '@/lib/user-roles';
import type { LeadStatus } from '@/lib/definitions';

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email') ||
                     request.nextUrl.searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email utente non fornita' },
        { status: 400 }
      );
    }

    const allowedRequestTypes = getAllowedRequestTypes(userEmail);
    const status = request.nextUrl.searchParams.get('status') as LeadStatus | null;
    const view = request.nextUrl.searchParams.get('view') || 'all';

    let leads: any[];

    if (view === 'all') {
      leads = await getAllLeads(allowedRequestTypes || undefined);
    } else {
      leads = await getLeads(status || undefined, allowedRequestTypes || undefined);
    }

    // Additional server-side filter for security
    const filteredLeads = allowedRequestTypes === null
      ? leads
      : leads.filter(lead =>
          !lead.requestType || allowedRequestTypes.includes(lead.requestType)
        );

    return NextResponse.json(filteredLeads);
  } catch (error) {
    console.error('Errore nel recupero dei lead:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dei lead' },
      { status: 500 }
    );
  }
}


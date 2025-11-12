import type { Lead } from './definitions';
import { subDays, formatISO } from 'date-fns';

let leads: Lead[] = [
  {
    id: 'lead-001',
    name: 'Mario Rossi',
    phone: '333 1234567',
    email: 'mario.rossi@example.com',
    status: 'Nuovo',
    vehicleOfInterest: 'Fiat Panda',
    notes: 'Ha chiamato per informazioni sulla promo attuale. Richiamare nel pomeriggio.',
    createdAt: formatISO(subDays(new Date(), 1)),
    agent: 'Luca Bianchi',
  },
  {
    id: 'lead-002',
    name: 'Giulia Verdi',
    phone: '347 7654321',
    email: 'giulia.verdi@example.com',
    status: 'Contattato',
    vehicleOfInterest: 'Jeep Renegade',
    notes: 'Contattata per fissare appuntamento. In attesa di sua conferma.',
    createdAt: formatISO(subDays(new Date(), 2)),
    agent: 'Sara Neri',
  },
  {
    id: 'lead-003',
    name: 'Marco Neri',
    phone: '329 1122334',
    email: 'marco.neri@example.com',
    status: 'In Lavorazione',
    vehicleOfInterest: 'Alfa Romeo Stelvio',
    notes: 'Preventivo inviato via email. In attesa di feedback.',
    createdAt: formatISO(subDays(new Date(), 5)),
    agent: 'Luca Bianchi',
  },
  {
    id: 'lead-004',
    name: 'Laura Gialli',
    phone: '338 5566778',
    email: 'laura.gialli@example.com',
    status: 'Chiuso',
    vehicleOfInterest: 'Lancia Ypsilon',
    notes: 'Contratto firmato. Cliente soddisfatto.',
    createdAt: formatISO(subDays(new Date(), 10)),
    agent: 'Sara Neri',
  },
  {
    id: 'lead-005',
    name: 'Paolo Marroni',
    phone: '366 9988776',
    email: 'paolo.marroni@example.com',
    status: 'Nuovo',
    vehicleOfInterest: 'Peugeot 208',
    notes: 'Interessato a test drive. Richiamare domani mattina.',
    createdAt: formatISO(new Date()),
    agent: 'Luca Bianchi',
  },
  {
    id: 'lead-006',
    name: 'Francesca Blu',
    phone: '339 1231231',
    email: 'francesca.blu@example.com',
    status: 'Contattato',
    vehicleOfInterest: 'Fiat 500 Elettrica',
    notes: 'Ha chiesto dettagli sugli incentivi statali. Inviata documentazione.',
    createdAt: formatISO(subDays(new Date(), 3)),
    agent: 'Sara Neri',
  },
];

// Simulate network delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getLeads(): Promise<Lead[]> {
  await sleep(500);
  return leads;
}

export async function getLeadById(id: string): Promise<Lead | undefined> {
  await sleep(300);
  return leads.find((lead) => lead.id === id);
}

export async function updateLead(id: string, data: Partial<Omit<Lead, 'id'>>): Promise<Lead | undefined> {
  await sleep(700);
  const leadIndex = leads.findIndex((lead) => lead.id === id);
  if (leadIndex === -1) {
    return undefined;
  }
  leads[leadIndex] = { ...leads[leadIndex], ...data };
  return leads[leadIndex];
}

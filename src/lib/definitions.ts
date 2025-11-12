export type LeadStatus = 'Nuovo' | 'Contattato' | 'In Lavorazione' | 'Chiuso';

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: LeadStatus;
  vehicleOfInterest: string;
  notes: string;
  createdAt: string; // ISO date string
  agent: string;
};

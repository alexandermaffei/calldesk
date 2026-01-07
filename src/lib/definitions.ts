export type LeadStatus = 'Da gestire' | 'Gestita';
export type RequestType = 'SALES' | 'PARTS' | 'SERVICE' | 'GENERICA';

export type Lead = {
  id: string;
  name: string; // NomeCognome
  phone: string; // Recapito
  status: LeadStatus; // StatusLavorazione
  notes: string; // RichiestaGenerica + RichiestaSpecifica
  operatorNotes?: string; // NoteOperatore
  vehicleOfInterest: string; // MarcaModello
  plate: string; // Targa
  interventionType: string; // TipoIntervento
  contactTime: string; // OrarioRicontatto
  preferredDate: string; // DataPreferita
  preferredTime: string; // Orario
  location: string; // Sede
  requestDate: string; // Data
  createdAt: string; // Created (Airtable metadata)
  agent: string; // Agent
  requestType?: RequestType; // TipoRichiesta (SALES, PARTS, SERVICE)
};

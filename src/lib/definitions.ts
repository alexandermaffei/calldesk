export type LeadStatus = 'Da contattare' | 'Contattato' | 'Contatto fallito, da ricontattare' | 'Nuovo' | 'In Lavorazione' | 'Chiuso' | 'Non Risponde' | 'Non interessato';

export type Lead = {
  id: string;
  name: string; // NomeCognome
  phone: string; // Recapito
  email: string; // Non presente in Airtable, ma mantenuto per compatibilità
  status: LeadStatus; // StatusLavorazione
  notes: string; // RichiestaGenerica + RichiestaSpecifica
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
};

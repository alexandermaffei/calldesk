export type LeadStatus = 'Da gestire' | 'Gestita';
export type RequestType = 'SALES' | 'PARTS' | 'SERVICE';

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
  requestType?: RequestType; // TipoRichiesta (SERVICE, PARTS, SALES)
  // Nuovi campi
  intestazione?: string; // Intestazione
  kilometraggio?: string; // Kilometraggio
  veicoloSostitutivo?: string; // VeicoloSostitutivo
  altreSegnalazioni?: string; // AltreSegnalazioni
  feedback?: string; // Feedback
  informazioniAuto?: string; // InformazioniAuto
  autoAlternativa?: string; // AutoAlternativa
  permuta?: string; // Permuta
  ragioneSociale?: string; // RagioneSociale
  pagamento?: string; // Pagamento
  venditore?: string; // Venditore
  cambio?: string; // Cambio
  alimentazione?: string; // Alimentazione
  sitoAnnuncio?: string; // SitoAnnuncio
  provenienza?: string; // Provenienza
  pezzoDiRicambio?: string; // PezzoDiRicambio
  tipoRichiestaSales?: string; // TipoRichiestaSales
};

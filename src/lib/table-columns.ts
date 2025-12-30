import type { UserRole } from './user-roles';

export type ColumnKey = 
  | 'cliente'
  | 'tipoRichiesta'
  | 'stato'
  | 'data'
  | 'nomeCognome'
  | 'recapito'
  | 'sede'
  | 'orarioRicontatto'
  | 'dataPreferita'
  | 'orario'
  | 'richiestaGenerica'
  | 'richiestaSpecifica'
  | 'altreSegnalazioni'
  | 'feedback'
  | 'marcaModello'
  | 'targa'
  | 'intestazione'
  | 'tipoIntervento'
  | 'kilometraggio'
  | 'veicoloSostitutivo'
  | 'pezzoDiRicambio'
  | 'tipoRichiestaSales'
  | 'provenienza'
  | 'informazioniAuto'
  | 'permuta'
  | 'pagamento'
  | 'ragioneSociale'
  | 'autoAlternativa'
  | 'venditore'
  | 'cambio'
  | 'alimentazione'
  | 'sitoAnnuncio'
  | 'noteOperatore'
  | 'dataCreazione'
  | 'azioni';

export interface ColumnConfig {
  key: ColumnKey;
  label: string;
  showForRoles: UserRole[];
  showForRequestTypes?: ('SALES' | 'SERVICE' | 'PARTS')[];
  alwaysShow?: boolean;
}

// Configurazione colonne per OFFICINA (SERVICE + PARTS)
const officinaColumns: ColumnConfig[] = [
  // Header - sempre visibili
  { key: 'data', label: 'Data', showForRoles: ['officina'], alwaysShow: true },
  { key: 'nomeCognome', label: 'Nome e Cognome', showForRoles: ['officina'], alwaysShow: true },
  { key: 'recapito', label: 'Recapito', showForRoles: ['officina'], alwaysShow: true },
  { key: 'tipoRichiesta', label: 'Tipo Richiesta', showForRoles: ['officina'], alwaysShow: true },
  { key: 'sede', label: 'Sede', showForRoles: ['officina'] },
  { key: 'orarioRicontatto', label: 'Orario Ricontatto', showForRoles: ['officina'] },
  { key: 'dataPreferita', label: 'Data Preferita', showForRoles: ['officina'] },
  { key: 'orario', label: 'Orario', showForRoles: ['officina'] },
  
  // Core - richiesta
  { key: 'richiestaGenerica', label: 'Richiesta Generica', showForRoles: ['officina'], alwaysShow: true },
  { key: 'richiestaSpecifica', label: 'Richiesta Specifica', showForRoles: ['officina'] },
  { key: 'altreSegnalazioni', label: 'Altre Segnalazioni', showForRoles: ['officina'] },
  { key: 'feedback', label: 'Feedback', showForRoles: ['officina'] },
  
  // SERVICE - campi tecnici (solo per SERVICE)
  { key: 'marcaModello', label: 'Marca Modello', showForRoles: ['officina'], showForRequestTypes: ['SERVICE', 'PARTS'] },
  { key: 'targa', label: 'Targa', showForRoles: ['officina'], showForRequestTypes: ['SERVICE', 'PARTS'] },
  { key: 'intestazione', label: 'Intestazione', showForRoles: ['officina'], showForRequestTypes: ['SERVICE'] },
  { key: 'tipoIntervento', label: 'Tipo Intervento', showForRoles: ['officina'], showForRequestTypes: ['SERVICE'] },
  { key: 'kilometraggio', label: 'Kilometraggio', showForRoles: ['officina'], showForRequestTypes: ['SERVICE'] },
  { key: 'veicoloSostitutivo', label: 'Veicolo Sostitutivo', showForRoles: ['officina'], showForRequestTypes: ['SERVICE'] },
  
  // PARTS - campi tecnici (solo per PARTS)
  { key: 'pezzoDiRicambio', label: 'Pezzo di Ricambio', showForRoles: ['officina'], showForRequestTypes: ['PARTS'] },
  
  // Workflow
  { key: 'stato', label: 'Stato', showForRoles: ['officina'], alwaysShow: true },
  { key: 'noteOperatore', label: 'Note Operatore', showForRoles: ['officina'], alwaysShow: true },
  { key: 'azioni', label: 'Azioni', showForRoles: ['officina'], alwaysShow: true },
];

// Configurazione colonne per SALES
const salesColumns: ColumnConfig[] = [
  // Header - sempre visibili
  { key: 'data', label: 'Data', showForRoles: ['sales'], alwaysShow: true },
  { key: 'nomeCognome', label: 'Nome e Cognome', showForRoles: ['sales'], alwaysShow: true },
  { key: 'recapito', label: 'Recapito', showForRoles: ['sales'], alwaysShow: true },
  { key: 'tipoRichiesta', label: 'Tipo Richiesta', showForRoles: ['sales'], alwaysShow: true },
  { key: 'tipoRichiestaSales', label: 'Tipo Richiesta Sales', showForRoles: ['sales'], alwaysShow: true },
  { key: 'provenienza', label: 'Provenienza', showForRoles: ['sales'] },
  { key: 'orarioRicontatto', label: 'Orario Ricontatto', showForRoles: ['sales'] },
  { key: 'dataPreferita', label: 'Data Preferita', showForRoles: ['sales'] },
  { key: 'orario', label: 'Orario', showForRoles: ['sales'] },
  { key: 'sede', label: 'Sede', showForRoles: ['sales'] },
  
  // Core - richiesta
  { key: 'richiestaGenerica', label: 'Richiesta Generica', showForRoles: ['sales'], alwaysShow: true },
  { key: 'richiestaSpecifica', label: 'Richiesta Specifica', showForRoles: ['sales'] },
  { key: 'informazioniAuto', label: 'Informazioni Auto', showForRoles: ['sales'] },
  { key: 'altreSegnalazioni', label: 'Altre Segnalazioni', showForRoles: ['sales'] },
  { key: 'feedback', label: 'Feedback', showForRoles: ['sales'] },
  
  // Dettagli commerciali
  { key: 'permuta', label: 'Permuta', showForRoles: ['sales'] },
  { key: 'pagamento', label: 'Pagamento', showForRoles: ['sales'] },
  { key: 'ragioneSociale', label: 'Ragione Sociale', showForRoles: ['sales'] },
  { key: 'autoAlternativa', label: 'Auto Alternativa', showForRoles: ['sales'] },
  { key: 'venditore', label: 'Venditore', showForRoles: ['sales'] },
  { key: 'cambio', label: 'Cambio', showForRoles: ['sales'] },
  { key: 'alimentazione', label: 'Alimentazione', showForRoles: ['sales'] },
  { key: 'sitoAnnuncio', label: 'Sito Annuncio', showForRoles: ['sales'] },
  
  // Workflow
  { key: 'stato', label: 'Stato', showForRoles: ['sales'], alwaysShow: true },
  { key: 'noteOperatore', label: 'Note Operatore', showForRoles: ['sales'], alwaysShow: true },
  { key: 'azioni', label: 'Azioni', showForRoles: ['sales'], alwaysShow: true },
];

// Configurazione colonne per ADMIN (vede tutto)
const adminColumns: ColumnConfig[] = [
  { key: 'cliente', label: 'Cliente', showForRoles: ['admin'], alwaysShow: true },
  { key: 'tipoRichiesta', label: 'Tipo Richiesta', showForRoles: ['admin'], alwaysShow: true },
  { key: 'stato', label: 'Stato', showForRoles: ['admin'], alwaysShow: true },
  { key: 'richiestaGenerica', label: 'Richiesta', showForRoles: ['admin'] },
  { key: 'marcaModello', label: 'Veicolo', showForRoles: ['admin'] },
  { key: 'targa', label: 'Targa', showForRoles: ['admin'] },
  { key: 'tipoIntervento', label: 'Tipo Intervento', showForRoles: ['admin'] },
  { key: 'sede', label: 'Sede', showForRoles: ['admin'] },
  { key: 'dataCreazione', label: 'Data Creazione', showForRoles: ['admin'] },
  { key: 'azioni', label: 'Azioni', showForRoles: ['admin'], alwaysShow: true },
];

/**
 * Ottiene le colonne da mostrare in base al ruolo utente
 */
export function getColumnsForRole(role: UserRole): ColumnConfig[] {
  switch (role) {
    case 'admin':
      return adminColumns;
    case 'officina':
      return officinaColumns;
    case 'sales':
      return salesColumns;
    default:
      return salesColumns;
  }
}

/**
 * Filtra le colonne in base al tipo di richiesta della lead
 */
export function shouldShowColumn(
  column: ColumnConfig,
  requestType?: string
): boolean {
  // Se la colonna è sempre visibile, mostrala
  if (column.alwaysShow) return true;
  
  // Se non ci sono filtri per tipo di richiesta, mostra la colonna
  if (!column.showForRequestTypes || column.showForRequestTypes.length === 0) {
    return true;
  }
  
  // Se non c'è un tipo di richiesta specificato, non mostrare colonne specifiche
  if (!requestType) return false;
  
  // Mostra solo se il tipo di richiesta corrisponde
  return column.showForRequestTypes.includes(requestType as 'SALES' | 'SERVICE' | 'PARTS');
}


export type UserRole = 'admin' | 'officina' | 'sales';

// Mappatura email -> ruolo
const USER_ROLES: Record<string, UserRole> = {
  'manuel.maffei@gruppomaffei.com': 'admin',
  'alex.maffei@gruppomaffei.com': 'admin',
  'vincenzo.sardone@gruppomaffei.com': 'officina',
  'anna.montineri@gruppomaffei.com': 'sales',
  'savino.bartolomeo@gruppomaffei.com': 'sales',
};

/**
 * Ottiene il ruolo dell'utente basato sulla sua email
 */
export function getUserRole(userEmail: string | null | undefined): UserRole {
  if (!userEmail) {
    return 'sales'; // Default role se non autenticato
  }
  return USER_ROLES[userEmail.toLowerCase()] || 'sales';
}

/**
 * Verifica se l'utente ha accesso admin
 */
export function isAdmin(userEmail: string | null | undefined): boolean {
  return getUserRole(userEmail) === 'admin';
}

/**
 * Ottiene i tipi di richiesta che l'utente può vedere in base al suo ruolo
 * @returns Array di TipoRichiesta permessi, o null se può vedere tutto (admin)
 */
export function getAllowedRequestTypes(userEmail: string | null | undefined): string[] | null {
  const role = getUserRole(userEmail);
  
  switch (role) {
    case 'admin':
      return null; // null = può vedere tutto
    case 'officina':
      return ['SERVICE', 'PARTS'];
    case 'sales':
      return ['SALES'];
    default:
      return ['SALES'];
  }
}


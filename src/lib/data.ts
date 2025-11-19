import type { Lead, LeadStatus } from './definitions';
import { formatISO } from 'date-fns';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'appn6ol1MU9Uv8Xac';
const AIRTABLE_TABLE_ID = 'tblYvH1wGmDj1zIXs';

const airtableApiUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

// Helper to map Airtable fields to our Lead model
const mapAirtableRecordToLead = (record: any): Lead => {
  const fields = record.fields;
  
  const richiestaGenerica = fields.RichiestaGenerica || '';
  const richiestaSpecifica = fields.RichiestaSpecifica || '';
  const notes = [richiestaGenerica, richiestaSpecifica].filter(Boolean).join(' - ');

  return {
    id: record.id,
    name: fields.NomeCognome || '',
    phone: fields.Recapito || '',
    email: fields.Email || `no-email-${record.id}@example.com`,
    status: fields.StatusLavorazione || 'Da contattare',
    notes: notes,
    vehicleOfInterest: fields.MarcaModello || 'N/A',
    plate: fields.Targa || 'N/A',
    interventionType: fields.TipoIntervento || 'N/A',
    contactTime: fields.OrarioRicontatto || 'N/A',
    preferredDate: fields.DataPreferita || 'N/A',
    preferredTime: fields.Orario || 'N/A',
    location: fields.Sede || 'N/A',
    requestDate: fields.Data ? formatISO(new Date(fields.Data)) : 'N/A',
    createdAt: fields.Created ? formatISO(new Date(fields.Created)) : new Date().toISOString(),
    agent: fields.Agent || 'Non Assegnato',
  };
};

export async function getAllLeads(): Promise<Lead[]> {
  return getLeads();
}

export async function getLeads(statusFilter?: LeadStatus): Promise<Lead[]> {
  let allRecords: any[] = [];
  let offset = '';

  try {
    do {
      let filterByFormula = "NOT({Recapito} = '')"; // Filter out records with empty phone number
      if (statusFilter) {
        filterByFormula = `AND(${filterByFormula}, {StatusLavorazione} = '${statusFilter}')`;
      }
      
      const url = new URL(airtableApiUrl);
      url.searchParams.append('filterByFormula', filterByFormula);
      url.searchParams.append('sort[0][field]', 'Created');
      url.searchParams.append('sort[0][direction]', 'desc');
      if (offset) {
        url.searchParams.append('offset', offset);
      }

      const response = await fetch(url.toString(), {
        headers,
        next: { revalidate: 0 }, // Disable caching
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error fetching leads from Airtable: ${response.statusText}, ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      allRecords = allRecords.concat(data.records);
      offset = data.offset;
    } while (offset);
    
    return allRecords.map(mapAirtableRecordToLead);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getLeadById(id: string): Promise<Lead | undefined> {
  try {
    const response = await fetch(`${airtableApiUrl}/${id}`, {
      headers,
      next: { revalidate: 0 },
    });
    if (!response.ok) {
       if (response.status === 404) return undefined;
      const errorData = await response.json();
      throw new Error(`Error fetching lead from Airtable: ${response.statusText}, ${JSON.stringify(errorData)}`);
    }
    const record = await response.json();
    return mapAirtableRecordToLead(record);
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function updateLead(id: string, data: Partial<Omit<Lead, 'id' | 'createdAt'>>): Promise<Lead | undefined> {
    const airtableData = {
        fields: {
            ...(data.name && { NomeCognome: data.name }),
            ...(data.phone && { Recapito: data.phone }),
            ...(data.status && { StatusLavorazione: data.status }),
            ...(data.notes && { RichiestaGenerica: data.notes }),
        }
    };

    try {
        const response = await fetch(`${airtableApiUrl}/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(airtableData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error updating lead in Airtable: ${response.statusText}, ${JSON.stringify(errorData)}`);
        }
        
        const record = await response.json();
        return mapAirtableRecordToLead(record);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

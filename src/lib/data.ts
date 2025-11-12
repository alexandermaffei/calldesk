import type { Lead, LeadStatus } from './definitions';
import { formatISO } from 'date-fns';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = 'appHOKi32Fw6IeAnp';
const AIRTABLE_TABLE_ID = 'tblYvH1wGmDj1zIXs';

const airtableApiUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

const headers = {
  Authorization: `Bearer ${AIRTABLE_API_KEY}`,
  'Content-Type': 'application/json',
};

// Helper to map Airtable fields to our Lead model
const mapAirtableRecordToLead = (record: any): Lead => {
  const fields = record.fields;
  return {
    id: record.id,
    name: fields.NomeCognome || '',
    phone: fields.Recapito || '',
    // The current app has email, but it's not in the Airtable schema. 
    // I'll default it to a placeholder.
    email: fields.Email || `no-email-${record.id}@example.com`, 
    status: fields.Status || 'Nuovo',
    vehicleOfInterest: fields.MarcaModello || 'Non specificato',
    notes: fields.RichiestaGenerica || '',
    createdAt: fields.Created ? formatISO(new Date(fields.Created)) : new Date().toISOString(),
    agent: fields.Agent || 'Non Assegnato',
  };
};

export async function getLeads(): Promise<Lead[]> {
  try {
    const response = await fetch(airtableApiUrl, {
      headers,
      next: { revalidate: 0 }, // Disable caching
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error fetching leads from Airtable: ${response.statusText}, ${JSON.stringify(errorData)}`);
    }
    const data = await response.json();
    return data.records.map(mapAirtableRecordToLead);
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

export async function updateLead(id: string, data: Partial<Omit<Lead, 'id'>>): Promise<Lead | undefined> {
    const airtableData = {
        fields: {
            ...(data.name && { NomeCognome: data.name }),
            ...(data.phone && { Recapito: data.phone }),
            ...(data.status && { Status: data.status }),
            ...(data.notes && { RichiestaGenerica: data.notes }),
             // Add other fields as necessary, mapping back to Airtable field names
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

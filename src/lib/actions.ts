"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateLead } from "./data";
import type { LeadStatus } from "./definitions";

const EditLeadSchema = z.object({
  id: z.string(),
  name: z.string().min(2, { message: "Il nome è obbligatorio." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  phone: z.string().min(5, { message: "Il numero di telefono è obbligatorio." }),
  status: z.enum(['Da contattare', 'Contattato', 'Contatto fallito, da ricontattare', 'Nuovo', 'In Lavorazione', 'Chiuso', 'Non Risponde', 'Non interessato']),
  notes: z.string().optional(),
});

export type State = {
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    status?: string[];
    notes?: string[];
  };
  message?: string | null;
};

export async function updateLeadAction(id: string, prevState: State, formData: FormData) {
  const validatedFields = EditLeadSchema.safeParse({
    id: id,
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Errore di validazione. Impossibile aggiornare il lead.",
    };
  }

  const { id: leadId, ...dataToUpdate } = validatedFields.data;

  try {
    await updateLead(leadId, dataToUpdate);
  } catch (error) {
    return {
      message: "Errore del database: Impossibile aggiornare il lead.",
    };
  }

  revalidatePath(`/lead/${leadId}`);
  revalidatePath("/");
  return { message: "Lead aggiornato con successo." };
}

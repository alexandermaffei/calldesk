"use client";

import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { updateLeadAction } from "@/lib/actions";
import type { Lead, LeadStatus } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const EditLeadSchema = z.object({
  name: z.string().min(2, { message: "Il nome è obbligatorio." }),
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  phone: z.string().min(5, { message: "Il numero di telefono è obbligatorio." }),
  status: z.enum(['Da contattare', 'Contattato', 'Contatto fallito, da ricontattare', 'Nuovo', 'In Lavorazione', 'Chiuso', 'Non Risponde', 'Non interessato']),
  notes: z.string().optional(),
});

type EditLeadFormValues = z.infer<typeof EditLeadSchema>;

const STATUS_OPTIONS: LeadStatus[] = ['Da contattare', 'Contattato', 'Contatto fallito, da ricontattare'];

export default function EditLeadForm({ lead }: { lead: Lead }) {
  const { toast } = useToast();
  const initialState = { message: null, errors: {} };
  const updateLeadWithId = updateLeadAction.bind(null, lead.id);
  const [state, dispatch] = useActionState(updateLeadWithId, initialState);

  const form = useForm<EditLeadFormValues>({
    resolver: zodResolver(EditLeadSchema),
    defaultValues: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      notes: lead.notes || "",
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.errors) {
        toast({
          title: "Errore",
          description: state.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Successo",
          description: state.message,
        });
      }
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modifica Dettagli Lead</CardTitle>
        <CardDescription>
          Aggiorna le informazioni del cliente e lo stato della trattativa.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form action={dispatch}>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Cliente</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefono</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stato</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona uno stato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                           <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Aggiungi note sulla chiamata o sulla trattativa..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Salva Modifiche</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

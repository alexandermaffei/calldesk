"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { MessageSquareQuote, Save, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useToast } from '@/hooks/use-toast';

interface OperatorNotesEditorProps {
  leadId: string;
  initialNotes: string;
  onSave?: () => void;
  onNotesChange?: (hasChanges: boolean) => void;
}

export interface OperatorNotesEditorRef {
  save: () => Promise<void>;
}

export const OperatorNotesEditor = forwardRef<OperatorNotesEditorRef, OperatorNotesEditorProps>(
  ({ leadId, initialNotes, onSave, onNotesChange }, ref) => {
    const [notes, setNotes] = useState(initialNotes || '');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
      setNotes(initialNotes || '');
    }, [initialNotes]);

    useEffect(() => {
      const hasChanges = notes !== (initialNotes || '');
      if (onNotesChange) {
        onNotesChange(hasChanges);
      }
    }, [notes, initialNotes, onNotesChange]);

    const saveNotes = async () => {
      setIsSaving(true);
      try {
        const response = await fetch(`/api/leads/${leadId}/operator-notes`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ operatorNotes: notes }),
        });

        if (!response.ok) {
          throw new Error('Errore nel salvataggio delle note');
        }

        toast({
          title: "Note salvate",
          description: "Le note operatore sono state salvate con successo.",
        });

        if (onSave) {
          onSave();
        }
      } catch (error) {
        console.error('Errore nel salvataggio delle note:', error);
        toast({
          title: "Errore",
          description: "Impossibile salvare le note. Riprova più tardi.",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsSaving(false);
      }
    };

    useImperativeHandle(ref, () => ({
      save: saveNotes,
    }));

    const handleSave = () => {
      saveNotes();
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareQuote className="size-5" />
          Note Operatore
        </CardTitle>
        <CardDescription>
          Aggiungi note personali su questo lead
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Scrivi qui le tue note..."
          className="min-h-[200px] resize-none"
        />
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Salvataggio...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Salva Note
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
});

OperatorNotesEditor.displayName = 'OperatorNotesEditor';


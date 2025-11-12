"use client";

import { useState } from "react";
import { Bot, Loader2, X } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function AIAgentButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAgentCall = async () => {
    setIsLoading(true);
    setAgentResponse(null);
    setError(null);
    setPopoverOpen(true);

    try {
      const response = await fetch(
        "https://hook.eu2.make.com/rwq2wb22gxx3guhbb36v3spa65ido155",
        {
          method: "POST",
          headers: {
            "x-make-apikey": "MWEjRKC4N9hY7h9hWx1gJKQnBDC3Cz7V",
          },
        }
      );

      if (response.ok) {
        const textResponse = await response.text();
        setAgentResponse(textResponse);
      } else {
        throw new Error("La richiesta al server non è andata a buon fine.");
      }
    } catch (err) {
      console.error("Errore durante la chiamata all'agente AI:", err);
      const errorMessage = err instanceof Error ? err.message : "Impossibile attivare l'agente AI.";
      setError(errorMessage);
      toast({
        title: "Errore",
        description: "Impossibile contattare l'agente AI. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-lg"
          onClick={handleAgentCall}
          disabled={isLoading}
        >
          <Bot className={cn("size-8 transition-transform", isLoading && 'scale-0')} />
          <Loader2 className={cn("absolute size-8 animate-spin", !isLoading && 'scale-0')} />
          <span className="sr-only">Attiva Agente AI</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 mr-4 mb-2" side="top" align="end">
        <div className="flex justify-between items-start">
            <div className="space-y-1">
                <h4 className="font-medium leading-none">Agente AI</h4>
                <p className="text-sm text-muted-foreground">
                    Analisi priorità lead in corso...
                </p>
            </div>
             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPopoverOpen(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Chiudi</span>
            </Button>
        </div>

        <div className="mt-4 text-sm whitespace-pre-wrap font-mono bg-muted/50 p-3 rounded-md min-h-[100px]">
          {isLoading && <p className="text-muted-foreground">Analizzando i lead...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {agentResponse && <p>{agentResponse}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}

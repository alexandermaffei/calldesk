"use client";

import { useState } from "react";
import { Bot, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AIAgentButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAgentCall = async () => {
    setIsLoading(true);
    toast({
      title: "Attivazione Agente AI...",
      description: "L'agente sta iniziando a processare i lead. Potrebbe volerci qualche istante.",
    });

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
        toast({
          title: "Agente AI Attivato",
          description: "L'agente ha iniziato a lavorare sui lead da contattare.",
        });
      } else {
        throw new Error("La richiesta al server non è andata a buon fine.");
      }
    } catch (error) {
      console.error("Errore durante la chiamata all'agente AI:", error);
      toast({
        title: "Errore",
        description: "Impossibile attivare l'agente AI. Riprova più tardi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}

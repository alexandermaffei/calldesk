"use client";

import { useState, useMemo, useEffect } from "react";
import { Bot, Loader2, X, Phone, User, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

export default function AIAgentButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Messaggi di analisi che cambiano ciclicamente
  const analyzingMessages = [
    "Analizzando i lead...",
    "Valutando le priorità...",
    "Identificando urgenze...",
    "Preparando raccomandazioni...",
  ];

  // Animazione ciclica dei messaggi durante il caricamento
  useEffect(() => {
    if (!isLoading) {
      setAnalyzingStep(0);
      return;
    }

    const interval = setInterval(() => {
      setAnalyzingStep((prev) => (prev + 1) % analyzingMessages.length);
    }, 2000); // Cambia messaggio ogni 2 secondi

    return () => clearInterval(interval);
  }, [isLoading, analyzingMessages.length]);

  // Funzione per formattare la risposta dell'agente AI
  const formatAgentResponse = (response: string) => {
    if (!response) return null;

    const lines = response.split('\n').filter(line => line.trim());
    const formatted: JSX.Element[] = [];
    
    let currentSection: string[] = [];
    let sectionType: 'header' | 'description' | 'actions' | null = null;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Rileva pattern per nome e telefono (es: "vitticano gino – +39 389 968 3467")
      const phoneMatch = trimmed.match(/^(.+?)\s*[–-]\s*(\+?\d[\d\s]+)$/);
      if (phoneMatch) {
        if (currentSection.length > 0) {
          formatted.push(renderSection(currentSection, sectionType, formatted.length));
          currentSection = [];
        }
        formatted.push(
          <Card key={`header-${index}`} className="mb-3 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{phoneMatch[1].trim()}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-mono">{phoneMatch[2].trim()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        return;
      }

      // Rileva se è una descrizione (non inizia con numero o punto elenco)
      if (!trimmed.match(/^\d+\.|^[-•*]/) && !trimmed.match(/^Chiamare|^Verificare|^Organizzare|^Avvisare|^Comunicare/)) {
        if (sectionType !== 'description' && currentSection.length > 0) {
          formatted.push(renderSection(currentSection, sectionType, formatted.length));
          currentSection = [];
        }
        sectionType = 'description';
        currentSection.push(trimmed);
        return;
      }

      // Rileva azioni (iniziano con verbi all'infinito)
      if (trimmed.match(/^(Chiamare|Verificare|Organizzare|Avvisare|Comunicare|Prenotare)/i)) {
        if (sectionType !== 'actions' && currentSection.length > 0) {
          formatted.push(renderSection(currentSection, sectionType, formatted.length));
          currentSection = [];
        }
        sectionType = 'actions';
        currentSection.push(trimmed.replace(/^\d+\.\s*/, '').trim());
        return;
      }

      // Default: aggiungi alla sezione corrente
      currentSection.push(trimmed.replace(/^\d+\.\s*/, '').trim());
    });

    // Aggiungi l'ultima sezione
    if (currentSection.length > 0) {
      formatted.push(renderSection(currentSection, sectionType, formatted.length));
    }

    return formatted.length > 0 ? formatted : <p className="text-sm">{response}</p>;
  };

  const renderSection = (lines: string[], type: string | null, key: number) => {
    if (type === 'description') {
      return (
        <Card key={`desc-${key}`} className="mb-3 border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm leading-relaxed text-foreground">{lines.join(' ')}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (type === 'actions') {
      return (
        <Card key={`actions-${key}`} className="mb-3 border-green-500/20 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <Badge variant="outline" className="text-xs border-green-500/30 text-green-600 dark:text-green-400">
                Azioni da intraprendere
              </Badge>
            </div>
            <ul className="space-y-2 mt-3">
              {lines.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-1.5 flex-shrink-0">•</span>
                  <span className="leading-relaxed text-foreground">{action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      );
    }

    // Default: testo semplice
    return (
      <div key={`text-${key}`} className="mb-2 text-sm leading-relaxed">
        {lines.map((line, idx) => (
          <p key={idx} className="mb-1">{line}</p>
        ))}
      </div>
    );
  };

  const formattedResponse = useMemo(() => {
    return agentResponse ? formatAgentResponse(agentResponse) : null;
  }, [agentResponse]);

  const handleAgentCall = async () => {
    setIsLoading(true);
    setAgentResponse(null);
    setError(null);
    setPopoverOpen(true);

    try {
      const response = await fetch("/api/ai-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: user?.email || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAgentResponse(data.response);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "La richiesta al server non è andata a buon fine.");
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
      <PopoverContent className="w-[420px] mr-4 mb-2 max-h-[600px] overflow-y-auto" side="top" align="end">
        <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
                <h4 className="font-semibold text-lg leading-none flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  Agente AI
                </h4>
                <p className="text-sm text-muted-foreground">
                    {isLoading ? "Analisi priorità lead in corso..." : "Risultati analisi"}
                </p>
            </div>
             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPopoverOpen(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Chiudi</span>
            </Button>
        </div>

        <Separator className="mb-4" />

        <div className="space-y-2 min-h-[100px]">
          {isLoading && (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4">
                  {/* Bot animato con sparkles */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <Bot className="h-12 w-12 text-primary relative z-10 animate-bounce" style={{ animationDuration: '2s' }} />
                  </div>
                  
                  {/* Testo animato con typing dots */}
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {analyzingMessages[analyzingStep]}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="flex gap-1">
                        <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}></span>
                        <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}></span>
                        <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}></span>
                      </span>
                    </div>
                  </div>

                  {/* Barra di progresso animata */}
                  <div className="w-full max-w-[200px] h-1.5 bg-primary/20 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full animate-[progress_2s_ease-in-out_infinite]" 
                         style={{ 
                           width: '70%',
                           backgroundSize: '200% 100%',
                         }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {error && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </CardContent>
            </Card>
          )}
          {formattedResponse && (
            <div className="space-y-0">
              {formattedResponse}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

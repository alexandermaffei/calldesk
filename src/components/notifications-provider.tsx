"use client";

import { useEffect } from 'react';
import { useDesktopNotifications } from '@/hooks/use-desktop-notifications';
import { Button } from './ui/button';
import { Bell, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NotificationsProvider() {
  const { isSupported, permission, requestPermission } = useDesktopNotifications();
  const { toast } = useToast();

  const handleRequestPermission = async () => {
    const perm = await requestPermission();
    if (perm === 'granted') {
      toast({
        title: "Notifiche attivate",
        description: "Riceverai notifiche quando arrivano nuove lead.",
      });
    } else if (perm === 'denied') {
      toast({
        title: "Notifiche bloccate",
        description: "Le notifiche sono state bloccate. Abilitalle nelle impostazioni del browser.",
        variant: "destructive",
      });
    }
  };

  // Mostra un banner se le notifiche non sono abilitate
  if (!isSupported) {
    return null;
  }

  if (permission === 'denied') {
    return (
      <div className="fixed bottom-4 left-4 z-50 rounded-lg border bg-background p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <BellOff className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Notifiche bloccate</p>
            <p className="text-xs text-muted-foreground">
              Abilita le notifiche nelle impostazioni del browser per ricevere avvisi sulle nuove lead.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === 'default') {
    return (
      <div className="fixed bottom-4 left-4 z-50 rounded-lg border bg-background p-4 shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <Bell className="size-5 text-primary mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">Attiva le notifiche</p>
            <p className="text-xs text-muted-foreground mb-3">
              Ricevi notifiche desktop quando arrivano nuove lead.
            </p>
            <Button size="sm" onClick={handleRequestPermission}>
              <Bell className="mr-2 size-4" />
              Attiva notifiche
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Notifiche attivate - nessun banner necessario
  return null;
}


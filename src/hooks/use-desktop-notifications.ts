"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Lead } from '@/lib/definitions';
import { useNotificationsStore } from './use-notifications-store';

interface NotificationLead {
  id: string;
  name: string;
  phone: string;
  vehicleOfInterest: string;
  interventionType: string;
  location: string;
}

interface UseDesktopNotificationsOptions {
  onNewLead?: (leadId: string) => void;
}

export function useDesktopNotifications(options?: UseDesktopNotificationsOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const eventSourceRef = useRef<EventSource | null>(null);
  const notifiedIdsRef = useRef<Set<string>>(new Set());
  const { addNotification, notifications } = useNotificationsStore();

  // Inizializza notifiedIdsRef con le leadId già presenti nello store
  useEffect(() => {
    notifications.forEach(notif => {
      notifiedIdsRef.current.add(notif.leadId);
    });
  }, []); // Solo all'avvio

  useEffect(() => {
    // Verifica se le notifiche sono supportate
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Richiedi permesso se non ancora concesso
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          setPermission(perm);
        });
      }
    }
  }, []);

  useEffect(() => {
    // Connetti sempre a SSE per salvare le notifiche nello store,
    // anche se le notifiche desktop non sono abilitate
    const eventSource = new EventSource('/api/leads/notifications');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'new_lead' && data.lead) {
          const lead: NotificationLead = data.lead;
          
          // Evita notifiche duplicate
          if (notifiedIdsRef.current.has(lead.id)) {
            return;
          }
          notifiedIdsRef.current.add(lead.id);

          // Salva la notifica nello store
          addNotification({
            leadId: lead.id,
            leadName: lead.name,
            leadPhone: lead.phone,
            vehicleOfInterest: lead.vehicleOfInterest,
            interventionType: lead.interventionType,
            location: lead.location,
          });

          // Mostra notifica desktop solo se permesso
          if (permission === 'granted') {
            const notification = new Notification('🔔 Nuova Lead Ricevuta', {
              body: `${lead.name}\n📞 ${lead.phone}\n🚗 ${lead.vehicleOfInterest}\n🔧 ${lead.interventionType}\n📍 ${lead.location}`,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: lead.id, // Previene notifiche duplicate con lo stesso tag
              requireInteraction: false,
            });

            // Apri la pagina quando si clicca sulla notifica
            notification.onclick = () => {
              window.focus();
              // Emetti un evento custom per aprire il dialog del lead
              window.dispatchEvent(new CustomEvent('openLeadDialog', { detail: { leadId: lead.id } }));
              // Chiama il callback se fornito
              if (options?.onNewLead) {
                options.onNewLead(lead.id);
              }
              notification.close();
            };

            // Chiudi automaticamente dopo 10 secondi
            setTimeout(() => {
              notification.close();
            }, 10000);
          }
        }
      } catch (error) {
        console.error('Errore nel parsing evento SSE:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Errore nella connessione SSE:', error);
      // Riconnessione automatica gestita da EventSource
    };

    // Cleanup
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [addNotification, options]);

  return {
    isSupported,
    permission,
    requestPermission: async () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        return perm;
      }
      return 'denied' as NotificationPermission;
    },
  };
}


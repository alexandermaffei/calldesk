"use client";

import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  vehicleOfInterest: string;
  interventionType: string;
  location: string;
  timestamp: number;
  read: boolean;
}

const STORAGE_KEY = 'callDesk_notifications';

export function useNotificationsStore() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Carica notifiche da localStorage all'avvio
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Notification[];
        // Rimuovi duplicati basati su leadId (mantieni solo la più recente)
        const uniqueNotifications = Array.from(
          parsed
            .reduce((map, notif) => {
              const existing = map.get(notif.leadId);
              if (!existing || notif.timestamp > existing.timestamp) {
                map.set(notif.leadId, notif);
              }
              return map;
            }, new Map<string, Notification>())
            .values()
        );
        // Ordina per timestamp (più recenti prima)
        uniqueNotifications.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(uniqueNotifications);
        // Salva la versione pulita
        if (uniqueNotifications.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueNotifications));
        }
      }
    } catch (error) {
      console.error('Errore nel caricamento notifiche:', error);
    }
  }, []);

  // Salva notifiche in localStorage
  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifications));
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Errore nel salvataggio notifiche:', error);
    }
  }, []);

  // Aggiungi una nuova notifica
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    setNotifications((prev) => {
      // Controlla se esiste già una notifica per questa leadId (evita duplicati)
      const existingNotification = prev.find(n => n.leadId === notification.leadId);
      if (existingNotification) {
        // Se esiste già, non aggiungere un duplicato
        return prev;
      }

      // Genera un ID unico usando leadId + timestamp + random per evitare collisioni
      const uniqueId = `${notification.leadId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: Notification = {
        ...notification,
        id: uniqueId,
        timestamp: Date.now(),
        read: false,
      };

      // Mantieni solo le ultime 50 notifiche
      const updated = [newNotification, ...prev].slice(0, 50);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Segna una notifica come letta
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) => {
      const updated = prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Segna tutte come lette
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((notif) => ({ ...notif, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Elimina una notifica
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((notif) => notif.id !== notificationId);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  // Elimina tutte le notifiche
  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };
}


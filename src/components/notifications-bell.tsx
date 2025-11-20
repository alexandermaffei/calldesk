"use client";

import { useState } from 'react';
import { Bell, Check, X, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import { useNotificationsStore } from '@/hooks/use-notifications-store';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotificationsStore();

  const handleNotificationClick = (notificationId: string, leadId: string) => {
    markAsRead(notificationId);
    // Emetti evento per aprire il dialog del lead
    window.dispatchEvent(new CustomEvent('openLeadDialog', { detail: { leadId } }));
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifiche</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel>Notifiche</DropdownMenuLabel>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
              >
                <Check className="mr-1 size-3" />
                Segna tutte lette
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
              >
                <Trash2 className="mr-1 size-3" />
                Elimina tutte
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="mb-2 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nessuna notifica</p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification, index) => (
                <div
                  key={`${notification.id}-${index}`}
                  className={cn(
                    "relative flex cursor-pointer flex-col gap-1 border-b px-3 py-3 transition-colors hover:bg-muted/50",
                    !notification.read && "bg-muted/30"
                  )}
                  onClick={() => handleNotificationClick(notification.id, notification.leadId)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Nuova Lead</p>
                        {!notification.read && (
                          <span className="size-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm font-semibold">{notification.leadName}</p>
                      <p className="text-xs text-muted-foreground">
                        📞 {notification.leadPhone}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        🚗 {notification.vehicleOfInterest} - {notification.interventionType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        📍 {notification.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


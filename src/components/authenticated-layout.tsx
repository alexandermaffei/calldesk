"use client";

import Link from 'next/link';
import { Home, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationsBell } from '@/components/notifications-bell';
import { UserMenu } from '@/components/user-menu';
import AIAgentButton from '@/components/ai-agent-button';
import { NotificationsProvider } from '@/components/notifications-provider';

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Phone className="size-6" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-headline text-xl font-bold tracking-tight">
                CallDesk
              </h2>
              <p className="text-xs text-muted-foreground">Lead Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <Home className="size-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
            <NotificationsBell />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
      <AIAgentButton />
      <NotificationsProvider />
    </>
  );
}


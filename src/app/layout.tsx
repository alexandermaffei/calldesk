import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, Phone, Settings, User } from 'lucide-react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AIAgentButton from '@/components/ai-agent-button';
import { NotificationsProvider } from '@/components/notifications-provider';
import { NotificationsBell } from '@/components/notifications-bell';

export const metadata: Metadata = {
  title: 'CallDesk Lead Manager',
  description: 'Gestione lead per concessionaria',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="overflow-hidden rounded-full"
                  >
                    <User className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Il Mio Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 size-4" />
                    Impostazioni
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
        </div>
        <AIAgentButton />
        <NotificationsProvider />
        <Toaster />
      </body>
    </html>
  );
}

"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { AuthenticatedLayout } from './authenticated-layout';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/login');
    }
    if (!loading && user && isLoginPage) {
      router.push('/');
    }
  }, [user, loading, router, isLoginPage]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Se è la pagina di login, mostra solo i children senza layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Se non c'è utente e non è login, non mostrare nulla (redirect in corso)
  if (!user) {
    return null;
  }

  // Utente autenticato: mostra layout completo
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}


"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Phone, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { login, resetPassword, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Accesso effettuato",
        description: "Benvenuto!",
      });
      router.push('/');
    } catch (error: any) {
      console.error('Errore login:', error);
      let errorMessage = 'Errore durante il login. Riprova.';
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email non valida.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Questo account è stato disabilitato.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Nessun account trovato con questa email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Password errata.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Credenziali non valide.';
      }

      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      await resetPassword(resetEmail);
      toast({
        title: "Email inviata",
        description: "Controlla la tua casella email per le istruzioni per reimpostare la password.",
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Errore reset password:', error);
      let errorMessage = 'Errore durante l\'invio dell\'email. Riprova.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Nessun account trovato con questa email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email non valida.';
      }

      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Phone className="size-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline text-center">CallDesk</CardTitle>
          <CardDescription className="text-center">
            {showForgotPassword ? 'Reimposta la password' : 'Accedi al tuo account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showForgotPassword ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-xs"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Password dimenticata?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  'Accedi'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="nome@esempio.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={resetLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Inserisci la tua email e ti invieremo un link per reimpostare la password.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmail('');
                  }}
                  disabled={resetLoading}
                >
                  Annulla
                </Button>
                <Button type="submit" className="flex-1" disabled={resetLoading}>
                  {resetLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Invio...
                    </>
                  ) : (
                    'Invia'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


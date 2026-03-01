import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Loader2, Lock, Mail, MonitorSmartphone } from 'lucide-react';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5173/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(`${data.error || 'Invalid credentials'}`);
      }

      navigate({ to: '/', reloadDocument: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('login.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-dvh flex items-center justify-center overflow-hidden gradient-bg">
      <div className="absolute top-4 end-4 z-20 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      {/* Dynamic ambient background orbs */}
      <div
        className="pointer-events-none absolute -top-[40%] -left-[10%] h-[800px] w-[800px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, oklch(0.65 0.2 265), transparent 60%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-[40%] -right-[10%] h-[700px] w-[700px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, oklch(0.6 0.18 290), transparent 60%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] px-4 animate-slide-up">
        {/* Logo / Brand */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl flex-shrink-0 glow-primary mb-6"
            style={{ background: 'linear-gradient(135deg, oklch(0.52 0.22 264), oklch(0.48 0.22 290))' }}>
            <MonitorSmartphone className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight gradient-text mb-2">{t('login.title')}</h1>
          <p className="text-muted-foreground text-sm">{t('login.subtitle')}</p>
        </div>

        {/* Login Card */}
        <Card className="glass-card shadow-2xl relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <CardHeader className="space-y-1 pb-6 pt-8 px-8 border-b border-border/50">
            <CardTitle className="text-xl text-foreground font-medium">{t('login.welcomeBack')}</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {t('login.enterCredentials')}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80 font-medium text-sm">{t('login.emailAddress')}</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 bg-black/20 border-white/10 focus-visible:border-primary/60 focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 rounded-xl transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground/80 font-medium text-sm">{t('login.password')}</Label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-11 bg-black/20 border-white/10 focus-visible:border-primary/60 focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 rounded-xl transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-11 font-medium bg-gradient-to-r from-primary via-blue-500 to-indigo-600 text-white hover:opacity-90 shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all duration-300 rounded-xl relative overflow-hidden group border-0"
                  style={{ background: 'linear-gradient(135deg, oklch(0.52 0.22 264), oklch(0.48 0.22 290))' }}
                  disabled={isLoading}
                >
                  {/* Subtle shine effect on hover */}
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                  
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin relative z-10" />
                      <span className="relative z-10">{t('login.signingIn')}</span>
                    </>
                  ) : (
                    <span className="relative z-10">{t('login.signIn')}</span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground/50">
          {t('login.footer')}
        </p>
      </div>
    </div>
  );
}

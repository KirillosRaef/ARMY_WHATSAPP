import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next';
import { AdminShell } from '@/components/admin_shell';
import { AlertCircle, CheckCircle2, Loader2, PackagePlus, Lock, Mail, Phone } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SingleValue } from 'react-select';

export const Route = createFileRoute('/admin/add_user')({
  component: RouteComponent,
})

type Option = { value: string; label: string };

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const roleOptions: Option[] = [
    { value: 'Admin', label: t('forms.roleAdmin') },
    { value: 'User', label: t('forms.roleUser') },
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);


  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [number, setNumber] = useState('');
  const [role, setRole] = useState<SingleValue<Option>>({ value: '', label: t('forms.selectRole') });
  
  const handleSubmitRequest = async () => {
    setSubmitError('');
    if (!name || !email || !password || !confirmPassword || !role || !number) {
      setSubmitError(t('forms.fillAllFields'));
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError(t('forms.passwordsDoNotMatch'));
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          number: number,
          role: role.value,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.message);
        return;
      }
      setSubmitSuccess(true);
      setTimeout(() => navigate({ to: '/admin/admin_page' }), 1500);
    } catch (err) {
      setSubmitError(t('forms.failedCreateUser'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <AdminShell>
      <div className="space-y-4 max-w-2xl mx-auto w-full animate-slide-up">
        <div className="flex flex-col gap-2 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <PackagePlus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">{t('nav.addUser')}</h1>
              <p className="text-muted-foreground text-xs mt-0.5">
                {t('forms.userRegistrationDesc')}
              </p>
            </div>
          </div>
        </div>

        {submitSuccess && (
          <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-400 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {t('forms.requestSubmittedSuccess')}
          </div>
        )}
        {submitError && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {submitError}
          </div>
        )}

        <Card className="glass-card overflow-hidden rounded-xl border border-border relative">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <CardHeader className="border-b border-border bg-muted/30 py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-[10px]">1</div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-medium text-foreground">{t('forms.addNewUser')}</CardTitle>
                <CardDescription className="text-[11px] mt-0.5 leading-tight">{t('forms.addNewUserDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium text-sm">{t('forms.fullName')}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t('forms.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 rounded-md text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium text-sm">{t('forms.emailAddress')}</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('forms.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 h-9 rounded-md text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium text-sm">{t('forms.password')}</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 h-9 rounded-md text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium text-sm">{t('forms.confirmPassword')}</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-9 h-9 rounded-md text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="number" className="text-foreground font-medium text-sm">{t('forms.number')}</Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
                <Input
                  id="number"
                  type="text"
                  placeholder={t('forms.numberPlaceholder')}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                  className="pl-9 h-9 rounded-md text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-sm">{t('forms.role')}</Label>
              <Select
                onValueChange={(value) => setRole({ value, label: value })}
              >
                <SelectTrigger className="w-full h-9 rounded-md">
                  <SelectValue placeholder={t('forms.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-3">
          <Button
            id="submit-request-btn"
            onClick={handleSubmitRequest}
            disabled={isSubmitting || submitSuccess}
            size="lg"
            className="px-6 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all rounded-xl relative overflow-hidden group h-10 text-sm"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin relative z-10" />
                <span className="relative z-10">{t('forms.processingRegistration')}</span>
              </>
            ) : submitSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 relative z-10" />
                <span className="relative z-10">{t('forms.registrationCompleted')}</span>
              </>
            ) : (
              <span className="relative z-10">{t('forms.submitRegistration')}</span>
            )}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}

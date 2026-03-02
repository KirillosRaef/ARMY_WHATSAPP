import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next';
import { AdminShell } from '@/components/admin_shell';
import { AlertCircle, CheckCircle2, Loader2, PackagePlus } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SingleValue } from 'react-select';
import { useQuery } from '@tanstack/react-query';
import LoadingComponent from '@/components/helpers/loading_component';
import ErrorComponent from '@/components/helpers/error_component';

export const Route = createFileRoute('/admin/add-branch')({
  component: RouteComponent,
})

type Option = { value: string; label: string };

// const militaryUnitOptions: Option[] = [
//   { value: 'Admin', label: 'Admin' },
//   { value: 'User', label: 'User' },
// ];

type MilitaryUnit = {
  id: string;
  militaryUnitName: string;
  branch: string;
};

const getMilitaryUnits = async () => {
  const res = await fetch('http://localhost:5173/api/military-units', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch military units');
  return res.json();
};

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [militaryUnitName, setMilitaryUnitName] = useState<SingleValue<Option>>({ value: '', label: '' });
  const [branch, setBranch] = useState('');

  const { data: militaryUnits, isLoading, error } = useQuery({
    queryKey: ['militaryUnits'],
    queryFn: getMilitaryUnits,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });

  const militaryUnitOptions = (militaryUnits ?? [])
  .filter((mu: MilitaryUnit) => mu.branch === '-')
  .map((mu: MilitaryUnit) => ({
    value: mu.militaryUnitName,
    label: mu.militaryUnitName,
  }));
  
  const handleSubmitRequest = async () => {
    setSubmitError('');
    if (!militaryUnitName || !branch) {
      setSubmitError('Please fill in all fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch('http://localhost:5173/api/military-unit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          militaryUnitName: militaryUnitName?.value,
          branch: branch,
        }),
      });
      setSubmitSuccess(true);
      setTimeout(() => navigate({ to: '/admin_page' }), 1500);
    } catch (err) {
      setSubmitError('Failed to create user. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  if (isLoading) {
    return <LoadingComponent shell='Admin' />;
  }

  if (error) {
    return <ErrorComponent error={error} shell='Admin' />;
  }
  
  return (
    <AdminShell>
      <div className="space-y-4 max-w-2xl mx-auto w-full animate-slide-up">
        <div className="flex flex-col gap-2 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <PackagePlus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">{t('nav.addBranch')}</h1>
              <p className="text-muted-foreground text-xs mt-0.5">
                {t('forms.equipmentRegistrationDesc')}
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
                <CardTitle className="text-sm font-medium text-foreground">{t('table.militaryUnit')}</CardTitle>
                <CardDescription className="text-[11px] mt-0.5 leading-tight">{t('forms.equipmentIdentifiersDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-sm">{t('table.militaryUnitName')}</Label>
              <Select
                onValueChange={(value) => setMilitaryUnitName({ value, label: value })}>
                <SelectTrigger className="w-full h-9 rounded-md">
                  <SelectValue placeholder={t('forms.militaryUnitPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {militaryUnitOptions.map((option: Option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch" className="text-foreground font-medium text-sm">
                {t('table.branch')}
              </Label>
              <Input
                id="branch"
                type="text"
                placeholder={t('table.militaryUnitNamePlaceholder')}
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="h-9 rounded-md text-sm"
              />
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

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';

import { AdminShell } from '@/components/admin_shell';
import { AlertCircle, CheckCircle2, Loader2, PackagePlus } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import ErrorComponent from '@/components/helpers/error_component';
import LoadingComponent from '@/components/helpers/loading_component';
import type { SingleValue } from 'react-select';

export const Route = createFileRoute('/admin/add-device-type')({
  component: RouteComponent,
})

const LOGO_URL = 'http://localhost:5173/api/image/logos';

type Option = { value: string; label: string };

type Brand = {
  brandName: string;
}

const getBrands = async () => {
  const brandsResponse = await fetch('http://localhost:5173/api/image/logos');
  if (!brandsResponse.ok) {
    throw new Error('Failed to fetch brands');
  }
  const data = await brandsResponse.json();
  const brands = data.map((brand: string) => ({
    brandName: brand,
  }));
  return brands;
}

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [brandPickerOpen, setBrandPickerOpen] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState<SingleValue<Option>>(null);
  const [brandName, setBrandName] = useState('');
  const [deviceKind, setDeviceKind] = useState('');
  const [description, setDescription] = useState('');


  const { data: brands, isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands as () => Promise<Brand[]>,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true, 
  });


  const brandOptions = brands?.map((brand: Brand) => ({
    value: brand.brandName,
    label: brand.brandName,
  })) || [];
  
  const handleSubmitRequest = async () => {
    setSubmitError('');
    if (!selectedBrand || !brandName || !deviceKind || !description) {
      setSubmitError(t('forms.fillAllFields'));
      return;
    }
    setIsSubmitting(true);
    try {
      await fetch('http://localhost:5173/api/device-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          brandName: brandName,
          deviceKind: deviceKind,
          description: description,
          brandLogo: selectedBrand?.value,
        }),
      });
      setSubmitSuccess(true);
      setTimeout(() => navigate({ to: '/admin_page' }), 1500);
    } catch (err) {
      setSubmitError(t('forms.failedSubmitRequest'));
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
              <h1 className="text-lg font-semibold tracking-tight text-foreground">{t('nav.addDeviceType')}</h1>
              <p className="text-muted-foreground text-xs mt-0.5">
                {t('forms.equipmentRegistrationDeviceTypeDesc')}
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
                <CardTitle className="text-sm font-medium text-foreground">{t('forms.addNewDeviceType')}</CardTitle>
                <CardDescription className="text-[11px] mt-0.5 leading-tight">{t('forms.equipmentRegistrationDeviceTypeDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-sm">{t('table.brandName')}</Label>
              <Popover open={brandPickerOpen} onOpenChange={setBrandPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {selectedBrand ? (
                      <div className="flex items-center gap-2.5">
                        <img
                          src={`${LOGO_URL}/${selectedBrand.value}`}
                          alt={brandName}
                          className="w-5 h-5 object-contain shrink-0"
                        />
                        <span className="text-foreground font-medium">{brandName}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{t('forms.selectBrand')}</span>
                    )}
                    <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start" sideOffset={4}>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[240px] overflow-y-auto [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden p-1">
                    {brandOptions.map((option: Option) => {
                      const isActive = selectedBrand?.value === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSelectedBrand({ value: option.value, label: option.label });
                            setBrandName(option.value.split('.')[0].charAt(0).toUpperCase() + option.value.split('.')[0].slice(1));
                            setBrandPickerOpen(false);
                          }}
                          className={[
                            'group relative flex items-center justify-center rounded-xl p-2.5 transition-all duration-200 cursor-pointer aspect-square',
                            isActive
                              ? 'ring-2 ring-primary ring-offset-1 ring-offset-background bg-primary/8 dark:bg-primary/15 shadow-lg shadow-primary/15'
                              : 'border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-md hover:scale-[1.03]',
                          ].join(' ')}
                        >
                          <img
                            src={`${LOGO_URL}/${option.value}`}
                            alt={option.label}
                            className="w-12 h-12 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
                            loading="lazy"
                          />
                          {isActive && (
                            <div className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                              <svg className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandName" className="text-foreground font-medium text-sm">{t('table.brandName')}</Label>
              <Input
                id="brandName"
                type="text"
                placeholder={t('brand.placeholder')}
                value={brandName}
                readOnly
                className="h-9 rounded-md text-sm bg-muted/50"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deviceKind" className="text-foreground font-medium text-sm">{t('table.deviceKind')}</Label>
                <Input
                  id="deviceKind"
                  type="text"
                  placeholder={t('forms.deviceKindPlaceholder')}
                  value={deviceKind}
                  onChange={(e) => setDeviceKind(e.target.value)}
                  className="h-9 rounded-md text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground font-medium text-sm">{t('table.description')}</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder={t('forms.descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-9 rounded-md text-sm"
                />
              </div>
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

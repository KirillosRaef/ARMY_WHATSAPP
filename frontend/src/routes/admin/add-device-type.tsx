import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

  const [selectedBrand, setSelectedBrand] = useState<SingleValue<Option>>(null);
  const [brandName, setBrandName] = useState('');
  const [deviceKind, setDeviceKind] = useState('');
  const [description, setDescription] = useState('');
  const [brandLogo, setBrandLogo] = useState('');

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
    <div className="space-y-8 max-w-5xl mx-auto w-full animate-slide-up">
      <div className="flex flex-col gap-2 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 flex-shrink-0 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
            <PackagePlus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('forms.equipmentRegistration')}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t('forms.equipmentRegistrationDeviceTypeDesc')}
            </p>
          </div>
        </div>
      </div>

      {submitSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          {t('forms.requestSubmittedSuccess')}
        </div>
      )}
      {submitError && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-fade-in">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {submitError}
        </div>
      )}

      <Card className="glass-card shadow-2xl overflow-hidden rounded-2xl border-white/10 relative">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-6 pt-6 px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">1</div>
            <div>
              <CardTitle className="text-lg font-medium text-foreground">{t('forms.addNewDeviceType')}</CardTitle>
              {/* <CardDescription className="text-sm mt-1">Ch</CardDescription> */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-8 space-y-8">
          <div className="space-y-3">
              <Label className="text-foreground font-medium text-sm">{t('table.brandName')}</Label>
              <Select
                onValueChange={
                (value) => {
                  setSelectedBrand({
                    value: value,
                    label: value.split('.')[0].charAt(0).toUpperCase() + value.split('.')[0].slice(1),
                  })
                  setBrandName(value.split('.')[0].charAt(0).toUpperCase() + value.split('.')[0].slice(1))
                }
                }
              >
                <SelectTrigger className="w-full border-white/10 bg-black/20 focus:ring-primary h-11 rounded-xl transition-all">
                  <SelectValue placeholder={t('forms.selectBrand')} />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#121212] rounded-xl shadow-xl">
                  <SelectGroup>
                    {brandOptions.map((option: Option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <img
                            src={`${LOGO_URL}/${option.value}`}
                            alt={option.label}
                            className="w-10 h-10 object-cover rounded-lg border border-white/10 shadow-sm"
                            loading="lazy"
                          />
                        </div>
                        {/* 
                          TODO: STORE THE BRAND NAME WITH THE BRANDLOGO IN THE DATABASE
                          TODO: LINK THE BRANDLOGO WITH THE BRAND NAME
                        */}
                        {/* {option.label.split('.')[0].charAt(0).toUpperCase() + option.label.split('.')[0].slice(1)} */}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

          <div className="space-y-3">
            <Label htmlFor="brandName" className="text-foreground font-medium text-sm">
              {t('table.brandName')}
            </Label>
            <Input
              id="brandName"
              type="text"
              placeholder={t('brand.placeholder')}
              value={brandName}
              // onChange={(e) => setBrandName(e.target.value)}
              className="bg-black/20 border-white/10 focus-visible:border-primary/60 focus-visible:ring-primary/20 h-11 rounded-xl font-mono tracking-wide placeholder:text-muted-foreground/40 transition-all"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="deviceKind" className="text-foreground font-medium text-sm">
              {t('table.deviceKind')}
            </Label>
            <Input
              id="deviceKind"
              type="text"
              placeholder={t('forms.deviceKindPlaceholder')}
              value={deviceKind}
              onChange={(e) => setDeviceKind(e.target.value)}
              className="bg-black/20 border-white/10 focus-visible:border-primary/60 focus-visible:ring-primary/20 h-11 rounded-xl font-mono tracking-wide placeholder:text-muted-foreground/40 transition-all"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="description" className="text-foreground font-medium text-sm">
              {t('table.description')}
            </Label>
            <Input
              id="description"
              type="text"
              placeholder={t('forms.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-black/20 border-white/10 focus-visible:border-primary/60 focus-visible:ring-primary/20 h-11 rounded-xl font-mono tracking-wide placeholder:text-muted-foreground/40 transition-all"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-6">
          <Button
            id="submit-request-btn"
            onClick={handleSubmitRequest}
            disabled={isSubmitting || submitSuccess}
            size="lg"
            className="px-8 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all rounded-xl relative overflow-hidden group h-12"
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

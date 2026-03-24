import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useState, type SetStateAction } from 'react';
import { useQuery } from '@tanstack/react-query';
import ImageUploadCrop from '../components/image_upload_crop';
import { UserShell } from '../components/user_shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, PackagePlus } from 'lucide-react';
import type { SingleValue } from 'react-select';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ErrorComponent from '@/components/helpers/error_component';
import LoadingComponent from '@/components/helpers/loading_component';

export const Route = createFileRoute('/request_to_add_device')({
  component: RouteComponent,
});

const LOGO_URL = 'http://localhost:5173/api/image/logos';

type Option = { value: string; label: string };


type MilitaryUnit = {
  id: string;
  militaryUnitName: string;
  branch: string;
};

type DeviceType = {
  id: string;
  brandName: string;
  deviceKind: string;
  description: string;
  brandLogo: string;
};

const getMilitaryUnits = async () => {
  const res = await fetch('http://localhost:5173/api/military-units');
  if (!res.ok) throw new Error('Failed to fetch military units');
  return res.json();
};

const getDeviceTypes = async () => {
  const res = await fetch('http://localhost:5173/api/device-types', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch device types');
  return res.json();
};

const selectStyles = {
  control: (base: object, state: { isFocused: boolean }) => ({
    ...base,
    background: 'hsl(var(--background))',
    border: state.isFocused
      ? '1px solid hsl(var(--primary))'
      : '1px solid hsl(var(--border))',
    borderRadius: '0.375rem',
    boxShadow: state.isFocused ? '0 0 0 1px hsl(var(--primary))' : 'none',
    color: 'hsl(var(--foreground))',
    minHeight: '40px',
    transition: 'all 0.15s',
    '&:hover': { border: '1px solid hsl(var(--primary) / 0.5)' },
  }),
  singleValue: (base: object) => ({ ...base, color: 'hsl(var(--foreground))' }),
  placeholder: (base: object) => ({ ...base, color: 'hsl(var(--muted-foreground))' }),
  menu: (base: object) => ({
    ...base,
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '0.375rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    zIndex: 50,
  }),
  option: (base: object, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    background: state.isSelected
      ? 'hsl(var(--primary) / 0.2)'
      : state.isFocused
      ? 'hsl(var(--muted))'
      : 'transparent',
    color: state.isSelected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
    borderRadius: '0.25rem',
    margin: '2px 4px',
    width: 'calc(100% - 8px)',
    cursor: 'pointer',
    transition: 'all 0.1s',
  }),
  input: (base: object) => ({ ...base, color: 'hsl(var(--foreground))' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base: object) => ({ ...base, color: 'hsl(var(--muted-foreground))' }),
};

function RouteComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const usageOptions: Option[] = [
    { value: 'New', label: t('usageBadge.new') },
    { value: 'Used', label: t('usageBadge.used') },
    { value: 'Broken', label: t('usageBadge.broken') },
  ];
  const [selectedDeviceType, setSelectedDeviceType] = useState<SingleValue<Option>>(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [selectedUsage, setSelectedUsage] = useState<SingleValue<Option>>(null);
  const [serialNumberPhotoFile, setSerialNumberPhotoFile] = useState<File>(new File([], ''));
  const [devicePhotoFile, setDevicePhotoFile] = useState<File>(new File([], ''));
  const [selectedMilitaryUnit, setSelectedMilitaryUnit] = useState<SingleValue<Option>>({ value: '', label: '' });
  const [selectedMilitaryUnitBranch, setSelectedMilitaryUnitBranch] = useState<SingleValue<Option>>({ value: '', label: '' });
  const [username, setUsername] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data: militaryUnits, isLoading: militaryUnitsLoading, error: militaryUnitsError } = useQuery({
    queryKey: ['militaryUnits'],
    queryFn: getMilitaryUnits as () => Promise<MilitaryUnit[]>,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });

  const militaryUnitMainOptions =
    militaryUnits?.filter((mu: { id: string; militaryUnitName: string; branch: string; }) => mu.branch === '-')
    .map((mu: { id: string; militaryUnitName: string; branch: string; }) => ({
      value: mu.id,
      label: `${mu.militaryUnitName}`,
    })) || [];
  
  const militaryUnitBranchOptions = 
    militaryUnits?.filter((mu: { id: string; militaryUnitName: string; branch: string; }) => mu.militaryUnitName === selectedMilitaryUnit?.label)
    .map((mu: { id: string; militaryUnitName: string; branch: string; }) => ({
      value: mu.id,
      label: `${mu.branch}`,
    })) || [];

  const { data: deviceTypes, isLoading, error } = useQuery({
    queryKey: ['deviceTypes'],
    queryFn: getDeviceTypes as () => Promise<DeviceType[]>,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });

  const deviceTypeOptions =
    deviceTypes?.map((dt: { id: string; brandName: string; deviceKind: string; description: string; }) => ({
      value: dt.id,
      label: `${dt.brandName} ${dt.deviceKind}${dt.description ? ' — ' + dt.description : ''}`,
    })) || [];

  const handleSubmitRequest = async () => {
    setSubmitError('');
    if (!selectedDeviceType || !selectedUsage || !serialNumber || !selectedMilitaryUnit || !selectedMilitaryUnitBranch || !username) {
      setSubmitError(t('forms.fillAllFields'));
      return;
    }
    // if (!serialNumberPhotoFile.name || !devicePhotoFile.name) {
    //   setSubmitError(t('forms.uploadBothPhotos'));
    //   return;
    // }
    setIsSubmitting(true);
    try {
      let serialNumberPhotoName = 'no-image.png';
      let devicePhotoName = 'no-image.png';

      // Upload serial number image (optional)
      if (serialNumberPhotoFile.name) {
        const formData = new FormData();
        formData.append('imageFile', serialNumberPhotoFile);
        formData.append('uploadDir', 'images/serial-numbers');

        const res = await fetch('http://localhost:5173/api/image/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Serial number image upload failed');
        serialNumberPhotoName = serialNumberPhotoFile.name;
      }

      // Upload device image (optional)
      if (devicePhotoFile.name) {
        const formData = new FormData();
        formData.append('imageFile', devicePhotoFile);
        formData.append('uploadDir', 'images/devices');

        const res = await fetch('http://localhost:5173/api/image/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Device image upload failed');

        devicePhotoName = devicePhotoFile.name;
      }
      const userID = await fetch('http://localhost:5173/api/user-id');
      if (!userID.ok) throw new Error('Failed to fetch user id');
      const userIDText = await userID.text();
      await fetch('http://localhost:5173/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: userIDText,
          deviceTypeId: selectedDeviceType.value,
          militaryUnitId: selectedMilitaryUnitBranch!.value,
          serialNumber,
          usage: selectedUsage.value,
          username,
          devicePhoto: devicePhotoName,
          serialNumberPhoto: serialNumberPhotoName,
        }),
      });
      setSubmitSuccess(true);
      setTimeout(() => navigate({ to: '/user_page' }), 1500);
    } catch (err) {
      setSubmitError(t('forms.failedSubmitRequest'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingComponent shell='User' />;
  }

  if (error) {
    return <ErrorComponent error={error} shell='User' />;
  }

  return (
    <UserShell>
      <div className="space-y-4 max-w-6xl mx-auto w-full animate-slide-up">
        <div className="flex flex-col gap-2 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <PackagePlus className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">{t('forms.equipmentRegistration')}</h1>
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
        <Card className="glass-card overflow-hidden rounded-xl border border-border relative flex flex-col min-w-0">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <CardHeader className="border-b border-border bg-muted/30 py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-[10px]">1</div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-medium text-foreground">{t('forms.equipmentIdentifiers')}</CardTitle>
                <CardDescription className="text-[11px] mt-0.5 leading-tight">{t('forms.equipmentIdentifiersDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-4 flex-1 min-h-0">
            <div className="grid gap-3 grid-cols-2">
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-sm">{t('forms.classificationGroup')}</Label>
              <Select
                onValueChange={
                  (value) => setSelectedDeviceType({
                    value,
                    label: deviceTypeOptions.find((option) => option.value === value)!.label
                  })}>
                <SelectTrigger className="w-full h-9 rounded-md">
                  <SelectValue placeholder={t('forms.deviceTypePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {deviceTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <img
                            src={`${LOGO_URL}/${deviceTypes!.find((dt) => dt.id === option.value)?.brandLogo}`}
                            alt="Device"
                            className="w-10 h-10 object-cover rounded-lg border border-border shadow-sm"
                            loading="lazy"
                          />
                        </div>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="w-full text-foreground font-medium text-sm">{t('forms.conditionStatus')}</Label>
              <Select
                onValueChange={
                  (value) => setSelectedUsage({
                    value,
                    label: usageOptions.find((option) => option.value === value)!.label
                  })
                }>
                <SelectTrigger className="w-full h-9 rounded-md">
                  <SelectValue placeholder={t('forms.selectOperationalStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {usageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial" className="text-foreground font-medium text-sm">
                {t('forms.serialNumber')}
              </Label>
              <Input
                id="serial"
                type="text"
                placeholder={t('forms.serialNumberPlaceholder')}
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="h-9 rounded-md font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-medium text-sm">{t('forms.classificationGroup')}</Label>
              <Select
                onValueChange={
                  (value) => setSelectedMilitaryUnit({
                    value,
                    label: militaryUnitMainOptions.find((option) => option.value === value)!.label
                  })}>
                <SelectTrigger className="w-full h-9 rounded-md">
                  <SelectValue placeholder={t('forms.militaryUnitPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {militaryUnitMainOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {!selectedMilitaryUnit!.value && (
              <div className="space-y-2">
                <Label className="text-foreground font-medium text-sm">{t('forms.militaryUnitBranch')}</Label>
                <Select>
                  <SelectTrigger className="w-full h-9 rounded-md">
                    <SelectValue placeholder={t('forms.militaryUnitBranchPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedMilitaryUnit!.value && (
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-sm">{t('forms.militaryUnitBranch')}</Label>
              <Select
                onValueChange={
                  (value) => setSelectedMilitaryUnitBranch({
                    value,
                    label: militaryUnitBranchOptions.find((option) => option.value === value)!.label
                  })}>
                <SelectTrigger className="w-full h-9 rounded-md">
                  <SelectValue placeholder={t('forms.militaryUnitBranchPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {militaryUnitBranchOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            )}

            <div className="space-y-2 col-span-2">
              <Label htmlFor="username" className="text-foreground font-medium text-sm">
                {t('table.username')}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={t('forms.usernamePlaceholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-9 rounded-md text-sm"
              />
            </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden rounded-xl border border-border relative flex flex-col min-w-0">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <CardHeader className="border-b border-border bg-muted/30 py-3 px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-[10px]">2</div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-medium text-foreground">{t('forms.visualVerification')}</CardTitle>
                <CardDescription className="text-[11px] mt-0.5 leading-tight">{t('forms.visualVerificationDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-4 flex-1 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ImageUploadCrop
                title={t('forms.serialNumberPhoto')}
                label={t('forms.dropOrClickToUpload')}
                aspect={1}
                onImageCropped={setSerialNumberPhotoFile}
              />
              <ImageUploadCrop
                title={t('forms.devicePhoto')}
                label={t('forms.dropOrClickToUpload')}
                aspect={1}
                onImageCropped={setDevicePhotoFile}
              />
            </div>
          </CardContent>
        </Card>
        </div>

        <div className="flex justify-end pt-3">
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
    </UserShell>
  );
}

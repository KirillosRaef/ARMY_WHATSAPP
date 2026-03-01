import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, type SetStateAction } from 'react';
import { useQuery } from '@tanstack/react-query';
import ImageUploadCrop from '../../components/image_upload_crop';
import { AdminShell } from '../../components/admin_shell';
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

export const Route = createFileRoute('/admin/add-device')({
  component: RouteComponent,
});

const LOGO_URL = 'http://localhost:5173/api/image/logos';

type Option = { value: string; label: string };

const usageOptions: Option[] = [
  { value: 'New', label: '✨ New' },
  { value: 'Used', label: '🔄 Used' },
  { value: 'Broken', label: '⚠️ Broken' },
];

type DeviceType = {
  id: string;
  brandName: string;
  deviceKind: string;
  description: string;
  brandLogo: string;
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
  const navigate = useNavigate();
  const [selectedDeviceType, setSelectedDeviceType] = useState<SingleValue<Option>>(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [selectedUsage, setSelectedUsage] = useState<SingleValue<Option>>(null);
  const [serialNumberPhotoFile, setSerialNumberPhotoFile] = useState<File>(new File([], ''));
  const [devicePhotoFile, setDevicePhotoFile] = useState<File>(new File([], ''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
      label: `${dt.brandName} ${dt.deviceKind}${dt.description ? ` — ` + dt.description : ``}`,
    })) || [];

  const handleSubmitRequest = async () => {
    setSubmitError('');
    if (!selectedDeviceType || !selectedUsage || !serialNumber) {
      setSubmitError('Please fill in all fields before submitting.');
      return;
    }
    if (!serialNumberPhotoFile.name || !devicePhotoFile.name) {
      setSubmitError('Please upload both the serial number and device photos.');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('imageFile', serialNumberPhotoFile);
      formData.append('uploadDir', 'images/serial-numbers');
      await fetch('http://localhost:5173/api/image/upload', { method: 'POST', body: formData });
      formData.set('imageFile', devicePhotoFile);
      formData.set('uploadDir', 'images/devices');
      await fetch('http://localhost:5173/api/image/upload', { method: 'POST', body: formData });
      await fetch('http://localhost:5173/api/device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          deviceTypeId: selectedDeviceType.value,
          serialNumber,
          usage: selectedUsage.value,
          devicePhoto: devicePhotoFile.name,
          serialNumberPhoto: serialNumberPhotoFile.name,
        }),
      });
      setSubmitSuccess(true);
      setTimeout(() => navigate({ to: '/admin_page' }), 1500);
    } catch (err) {
      setSubmitError('Failed to submit request. Please try again.');
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
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Equipment Registration</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Complete the requirements below to submit a new device to the network.
              </p>
            </div>
          </div>
        </div>

        {submitSuccess && (
          <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            Request submitted successfully! Redirecting...
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
                <CardTitle className="text-lg font-medium text-foreground">Equipment Identifiers</CardTitle>
                <CardDescription className="text-sm mt-1">Select the classification and unique serial</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-8 space-y-8">
            <div className="space-y-3">
              <Label className="text-foreground font-medium text-sm">Classification Group</Label>
              <Select
                onValueChange={
                  (value) => setSelectedDeviceType({
                    value,
                    label: deviceTypeOptions.find((option) => option.value === value)!.label
                  })}>
                <SelectTrigger className="w-full border-white/10 bg-black/20 focus:ring-primary h-11 rounded-xl transition-all">
                  <SelectValue placeholder="Select a device type..." />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#121212] rounded-xl shadow-xl">
                  <SelectGroup>
                    {deviceTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <img
                            src={`${LOGO_URL}/${deviceTypes!.find((dt) => dt.id === option.value)?.brandLogo}`}
                            alt="Device"
                            className="w-10 h-10 object-cover rounded-lg border border-white/10 shadow-sm"
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

            <div className="space-y-3">
              <Label className="w-full text-foreground font-medium text-sm">Condition Status</Label>
              <Select
                onValueChange={
                  (value) => setSelectedUsage({
                    value,
                    label: usageOptions.find((option) => option.value === value)!.label
                  })
                }>
                <SelectTrigger className="w-full border-white/10 bg-black/20 focus:ring-primary h-11 rounded-xl transition-all">
                  <SelectValue placeholder="Select operational status..." />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#121212] rounded-xl shadow-xl">
                  <SelectGroup>
                    {usageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="rounded-lg focus:bg-white/5 my-0.5 cursor-pointer">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="serial" className="text-foreground font-medium text-sm">
                Serial Number
              </Label>
              <Input
                id="serial"
                type="text"
                placeholder="e.g. SN-1234567890"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="bg-black/20 border-white/10 focus-visible:border-primary/60 focus-visible:ring-primary/20 h-11 rounded-xl font-mono tracking-wide placeholder:text-muted-foreground/40 transition-all"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-2xl overflow-hidden rounded-2xl border-white/10 relative">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-6 pt-6 px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">2</div>
              <div>
                <CardTitle className="text-lg font-medium text-foreground">Visual Verification</CardTitle>
                <CardDescription className="text-sm mt-1">Upload required photographic evidence</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-8">
            <div className="grid grid-cols-2 gap-6">
              <ImageUploadCrop
                title="Serial Number Photo"
                label="Drop or click to upload"
                aspect={1}
                onImageCropped={setSerialNumberPhotoFile}
              />
              <ImageUploadCrop
                title="Device Photo"
                label="Drop or click to upload"
                aspect={1}
                onImageCropped={setDevicePhotoFile}
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
                <span className="relative z-10">Processing Registration...</span>
              </>
            ) : submitSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 relative z-10" />
                <span className="relative z-10">Registration Completed</span>
              </>
            ) : (
              <span className="relative z-10">Submit Registration</span>
            )}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}

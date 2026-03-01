import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { AdminShell } from '@/components/admin_shell';
import { AlertCircle, CheckCircle2, Loader2, PackagePlus, Lock, Mail } from 'lucide-react';
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
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);


  const [militaryUnitName, setMilitaryUnitName]
    = useState<SingleValue<Option>>({ value: '', label: 'Select a military unit' });
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
  
  return (<AdminShell>
    <div className="space-y-8 max-w-5xl mx-auto w-full animate-slide-up">
      <div className="flex flex-col gap-2 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 flex-shrink-0 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
            <PackagePlus className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">User Registration</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Complete the requirements below to submit a new user to the network.
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
              <CardTitle className="text-lg font-medium text-foreground">Add a new User</CardTitle>
              <CardDescription className="text-sm mt-1">Check the requirements below before submitting.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 px-8 pb-8 space-y-8">

          <div className="space-y-3">
              <Label className="w-full text-foreground font-medium text-sm">Military Unit</Label>
              <Select
                onValueChange={
                  (value) => setMilitaryUnitName({
                    value,
                    label: value
                  })
                }>
                <SelectTrigger className="w-full border-white/10 bg-black/20 focus:ring-primary h-11 rounded-xl transition-all">
                  <SelectValue placeholder="Select operational status..." />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#121212] rounded-xl shadow-xl">
                  <SelectGroup>
                    {militaryUnitOptions.map((option: Option) => (
                      <SelectItem key={option.value} value={option.value} className="rounded-lg focus:bg-white/5 my-0.5 cursor-pointer">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="branch" className="text-foreground font-medium text-sm">
              Branch Name
            </Label>
            <Input
              id="branch"
              type="text"
              placeholder="e.g. 1st Armored Division"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
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

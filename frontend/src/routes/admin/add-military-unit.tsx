import { AdminShell } from '@/components/admin_shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Loader2, PackagePlus, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/admin/add-military-unit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [militaryUnitName, setMilitaryUnitName] = useState('');
  const navigate = useNavigate();

  const handleAddMilitaryUnit = async () => {
    setSubmitError('');
    // if (!militaryUnitLogoFile.name) {
    //   setSubmitError('Please upload a brand logo.');
    //   return;
    // }
    setIsSubmitting(true);
    try {
      // const formData = new FormData();
      // const newFile = new File([militaryUnitLogoFile], militaryUnitName + '.png');
      // formData.append('imageFile', newFile);
      // formData.append('uploadDir', 'images/military-unit-logos');
      // await fetch(`http://localhost:5173/api/image/upload`, {
      //   method: 'POST',
      //   body: formData,
      // });
      await fetch(`http://localhost:5173/api/military-unit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          militaryUnitName: militaryUnitName,
          branch: '-',
        }),
      });
      setSubmitSuccess(true);
      setTimeout(() => navigate({ to: '/admin_page' }), 1500);
    } catch (error) {
      setSubmitError(t('forms.failedAddMilitaryUnit'));
      console.error('Error adding military unit:', error);
    } finally {
      setIsSubmitting(false);
    }
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
              <h1 className="text-lg font-semibold tracking-tight text-foreground">{t('nav.addMilitaryUnit')}</h1>
              <p className="text-muted-foreground text-xs mt-0.5">
                {t('forms.enterMilitaryUnitName')}
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
                <CardTitle className="text-sm font-medium text-foreground">{t('forms.unitDetails')}</CardTitle>
                <CardDescription className="text-[11px] mt-0.5 leading-tight">{t('forms.enterMilitaryUnitName')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="militaryUnitName" className="text-foreground font-medium text-sm">
                {t('forms.militaryUnitName')}
              </Label>
              <Input
                id="militaryUnitName"
                type="text"
                placeholder={t('forms.militaryUnitNamePlaceholder')}
                value={militaryUnitName}
                onChange={(e) => setMilitaryUnitName(e.target.value)}
                className="h-9 rounded-md text-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-3">
          <Button
            id="submit-request-btn"
            onClick={handleAddMilitaryUnit}
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
  )
}

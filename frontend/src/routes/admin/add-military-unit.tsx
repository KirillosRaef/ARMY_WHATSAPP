import { AdminShell } from '@/components/admin_shell'
// import ImageUploadCrop from '@/components/image_upload_crop'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Loader2 } from 'lucide-react'
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
      <div>
        <Card className="glass-card shadow-2xl overflow-hidden rounded-2xl border-white/10 relative">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-6 pt-6 px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-semibold text-sm">1</div>
              <div>
                <CardTitle className="text-lg font-medium text-foreground">{t('forms.unitDetails')}</CardTitle>
                <CardDescription className="text-sm mt-1">{t('forms.enterMilitaryUnitName')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 px-8 pb-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-foreground font-medium text-sm">
                {t('forms.militaryUnitName')}
              </Label>
              <Input
                id="militaryUnitName"
                type="text"
                placeholder={t('forms.militaryUnitNamePlaceholder')}
                value={militaryUnitName}
                onChange={(e) => setMilitaryUnitName(e.target.value)}
                className="bg-black/20 border-white/10 focus-visible:border-primary/60 focus-visible:ring-primary/20 h-11 rounded-xl font-mono tracking-wide placeholder:text-muted-foreground/40 transition-all"
              />
            </div>
          </CardContent>
        </Card>  
        <div className="flex justify-end pt-6">
          <Button
            id="submit-request-btn"
            onClick={handleAddMilitaryUnit}
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
  )
}

import { AppShell } from '@/components/app_shell'
import ImageUploadCrop from '@/components/image_upload_crop'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/add-brand')({
  component: RouteComponent,
})

function RouteComponent() {
  const [brandLogoFile, setBrandLogoFile] = useState<File>(new File([], ''));
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [brandName, setBrandName] = useState('');
  const navigate = useNavigate();

  const handleAddBrand = async () => {
    setSubmitError('');
    if (!brandLogoFile.name) {
      setSubmitError('Please upload a brand logo.');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      const newFile = new File([brandLogoFile], brandName + '.png');
      formData.append('imageFile', newFile);
      formData.append('uploadDir', 'images/logos');
      await fetch(`http://localhost:5173/api/image/upload`, {
        method: 'POST',
        body: formData,
      });
      setSubmitSuccess(true);
      setTimeout(() => navigate({ to: '/admin_page' }), 1500);
    } catch (error) {
      setSubmitError('Failed to upload brand logo.');
      console.error('Error uploading brand logo:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div>
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
                title="Brand Logo"
                label="Drop or click to upload"
                aspect={1}
                onImageCropped={setBrandLogoFile}
              />
            </div>
            <div className="space-y-3">
            <Label htmlFor="name" className="text-foreground font-medium text-sm">
              Brand Name
            </Label>
            <Input
              id="brandName"
              type="text"
              placeholder="e.g. John Doe"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="bg-black/20 border-white/10 focus-visible:border-primary/60 focus-visible:ring-primary/20 h-11 rounded-xl font-mono tracking-wide placeholder:text-muted-foreground/40 transition-all"
            />
          </div>
          </CardContent>
        </Card>  
        <Button onClick={handleAddBrand}>Add Brand</Button>
      </div>
    </AppShell>
  )
}

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Upload, Check, X, ZoomIn } from 'lucide-react';

type Props = {
  title: string;
  label: string;
  aspect?: number;
  onImageCropped: (file: File) => void;
};

export default function ImageUploadCrop({ title, label, aspect = 1, onImageCropped }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [actualFileName, setActualFileName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setTempImage(imageUrl);
    setActualFileName(file.name);
    setIsModalOpen(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const onCropComplete = (_: Area, croppedArea: Area) => {
    setCroppedAreaPixels(croppedArea);
  };

  const getCroppedImg = async (imageSrc: string, crop: Area): Promise<Blob> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = crop.width;
    canvas.height = crop.height;
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
    });
  };

  const handleConfirm = async () => {
    if (!croppedAreaPixels || !tempImage) return;
    const blob = await getCroppedImg(tempImage, croppedAreaPixels);
    const previewUrl = URL.createObjectURL(blob);
    setPreview(previewUrl);
    onImageCropped(new File([blob], actualFileName, { type: 'image/jpeg' }));
    setIsModalOpen(false);
    setTempImage(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setTempImage(null);
  };

  const handleReupload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setTempImage(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-foreground/80">{title}</p>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={[
          'relative flex flex-col items-center justify-center rounded-md border border-input bg-transparent cursor-pointer transition-all duration-200 overflow-hidden',
          isDragActive
            ? 'border-primary/60 bg-primary/5 scale-[1.01]'
            : preview
            ? 'border-transparent'
            : 'hover:border-primary/40 hover:bg-muted/30 focus-visible:ring-ring/50 focus-visible:ring-2',
        ].join(' ')}
        style={{ width: '100%', aspectRatio: aspect === 1 ? '1/1' : '16/9', minHeight: 100 }}
      >
        <input {...getInputProps()} />
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleReupload}
                className="flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/25 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                Re-upload
              </button>
            </div>
            {/* Uploaded indicator */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full bg-green-500/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Check className="h-3 w-3" />
              Uploaded
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: 'oklch(0.52 0.22 264 / 12%)' }}
            >
              <Upload className="h-5 w-5 text-primary/70" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-xs text-muted-foreground/60">PNG, JPG, WEBP supported</p>
          </div>
        )}
      </div>

      {/* Crop Modal - theme-aware for light and dark mode */}
      {isModalOpen && tempImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className="relative flex flex-col rounded-2xl border border-border bg-card text-card-foreground shadow-2xl overflow-hidden"
            style={{ width: 500, maxWidth: '95vw' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <ZoomIn className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Crop Image</span>
              </div>
              <button
                onClick={handleCancel}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Crop area - no grey frame: overlay matches modal background */}
            <div className="relative w-full bg-card" style={{ height: 380 }}>
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                objectFit="cover"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  cropAreaStyle: { boxShadow: '0 0 0 9999em var(--card)' },
                }}
              />
            </div>

            {/* Zoom slider - theme-aware track and thumb */}
            <div className="px-5 py-3 border-t border-border">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-10">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer bg-muted accent-primary [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary"
                />
                <span className="text-xs text-muted-foreground w-10 text-right">{zoom.toFixed(1)}x</span>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4">
              <Button variant="ghost" size="sm" onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                className="px-5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl"
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Confirm crop
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

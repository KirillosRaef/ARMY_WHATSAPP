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
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden',
          isDragActive
            ? 'border-primary/60 bg-primary/10 scale-[1.01]'
            : preview
            ? 'border-transparent'
            : 'border-white/15 bg-white/4 hover:border-primary/40 hover:bg-primary/5',
        ].join(' ')}
        style={{ width: '100%', aspectRatio: aspect === 1 ? '1/1' : '16/9', minHeight: 150 }}
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

      {/* Crop Modal */}
      {isModalOpen && tempImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'oklch(0 0 0 / 75%)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="relative flex flex-col rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            style={{ background: 'oklch(0.155 0.02 264)', width: 500, maxWidth: '95vw' }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
              <div className="flex items-center gap-2">
                <ZoomIn className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Crop Image</span>
              </div>
              <button
                onClick={handleCancel}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/8 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Crop area */}
            <div style={{ position: 'relative', width: '100%', height: 380 }}>
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom slider */}
            <div className="px-5 py-3 border-t border-white/8">
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-10">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer"
                  style={{ accentColor: 'oklch(0.6 0.22 264)' }}
                />
                <span className="text-xs text-muted-foreground w-10 text-right">{zoom.toFixed(1)}x</span>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-end gap-3 border-t border-white/8 px-5 py-4">
              <Button variant="ghost" size="sm" onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                className="px-5 font-semibold"
                style={{ background: 'linear-gradient(135deg, oklch(0.52 0.22 264), oklch(0.48 0.22 290))' }}
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

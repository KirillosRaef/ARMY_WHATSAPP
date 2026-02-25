import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

type Props = {
  title: string;
  label: string;
  aspect?: number;
  onImageCropped: (blob: Blob) => void;
};

export default function ImageUploadCrop({
  title,
  label,
  aspect = 1,
  onImageCropped,
}: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const imageUrl = URL.createObjectURL(file);
    setTempImage(imageUrl);
    setIsModalOpen(true);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
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

    ctx.drawImage(
      image,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height,
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Upload Area */}
      <p>{title}</p>
      <div
        {...getRootProps()}
        style={{
          border: preview ? '0' : '2px dashed #888',
          // padding: 20,
          width: 400,
          height: 200,
          display: 'flex',
          cursor: 'pointer',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img
            src={preview}
            alt='Preview'
            style={{ width: '100%', borderRadius: 8 }}
          />
        ) : (
          <p>{label}</p>
        )}
      </div>

      {/* Crop Modal */}
      {isModalOpen && tempImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              width: 500,
              padding: 20,
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: 400 }}>
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

            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button
                onClick={async () => {
                  if (!croppedAreaPixels) return;

                  const blob = await getCroppedImg(
                    tempImage,
                    croppedAreaPixels,
                  );

                  const previewUrl = URL.createObjectURL(blob);
                  setPreview(previewUrl);
                  onImageCropped(blob);

                  setIsModalOpen(false);
                  setTempImage(null);
                }}
              >
                Confirm
              </button>

              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setTempImage(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useCallback } from 'react';
import Select, { type SingleValue } from 'react-select';
import { useQuery } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

export const Route = createFileRoute('/request_to_add_device')({
  component: RouteComponent,
})

type Option = { value: string; label: string };

const usageOptions: Option[] = [
  { value: 'New', label: 'New' },
  { value: 'Used', label: 'Used' },
  { value: 'Broken', label: 'Broken' },
];


type DeviceType = {
  id: string;
  brandName: string;
  deviceKind: string;
  description: string;
};

const getDeviceTypes = async () => {
  const res = await fetch('http://localhost:5173/api/device-types', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch device types');
  }

  const data = await res.json();
  console.log('Device types response:', data);
  return data;
};


function RouteComponent() {
  //TODO: Add components to get the deviceId (dropdown search with values from deviceType),
  //TODO: serialNumber (text), and usage (dropdown enum) 
  //TODO: with two pictures, serialNumber, and devicePhoto
  //
  //TODO: button to add this request to the requests table *IF* all values inserted
  const [selectedDeviceType, setSelectedDeviceType] =
    useState<SingleValue<Option>>({
      value: 'Select id',
      label: 'Select device type',
    });
  const [serialNumber, setSerialNumber] = useState('');
  const [selectedUsage, setSelectedUsage] = useState<SingleValue<Option>>({
    value: 'Select usage',
    label: 'Select usage',
  });

  const [serialNumberImage, setSerialNumberImage] = useState('');
  const [serialCrop, setSerialCrop] = useState({ x: 0, y: 0 });
  const [serialZoom, setSerialZoom] = useState(1);
  const [serialCroppedAreaPixels, setSerialCroppedAreaPixels] = useState<Area>({ x: 0, y: 0, width: 0, height: 0 });
  const [isCropPopupOpen, setIsCropPopupOpen] = useState(false);
  const [popupImage, setPopupImage] = useState('');


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setSerialNumberImage(URL.createObjectURL(file));

    setPopupImage(URL.createObjectURL(file));
    setIsCropPopupOpen(true);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  const onSerialCropComplete = (croppedArea: Area, croppedAreaPx: Area) => {
    setSerialCroppedAreaPixels(croppedAreaPx);
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
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 1);
    });
  };

  const {
    data: deviceTypes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['deviceTypes'],
    queryFn: getDeviceTypes as () => Promise<DeviceType[]>,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true, // Always refetch when component mounts
  });

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-xl'>Loading device types...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-xl text-red-600'>Error: {error.message}</div>
      </div>
    );
  }

  const deviceTypeOptions = deviceTypes?.map((dt) => ({
    value: dt.id,
    label: `${dt.brandName} ${dt.deviceKind} ${dt.description}`,
  })) || [];

  return (
    // console.log('Selected device type:', deviceTypes),
    <div>
      <Select
        defaultValue={selectedDeviceType}
        onChange={(newValue) => setSelectedDeviceType(newValue)}
        options={deviceTypeOptions}
      />
      <div className='p-2 flex flex-col gap-2'>
        <input
          type='text'
          placeholder='Serial Number'
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          className='p-2 border rounded'
        />
      </div>
      <Select
        defaultValue={selectedUsage}
        onChange={(newValue) => setSelectedUsage(newValue)}
        options={usageOptions}
      />


      <div className='p-2 flex flex-col gap-2'>
        <p className='font-bold'>Serial Number Photo</p>
      {!serialNumberImage && (
        <div
          {...getRootProps()}
          style={{
            width: '400px',
            border: '2px dashed #888',
            padding: 20,
          }}
        >
          <input {...getInputProps()} />
          <p>Drag & drop or click to upload serial number image</p>
        </div>
      )}

      {isCropPopupOpen && popupImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              width: '500px',
              height: '500px',
              position: 'relative',
              padding: 20,
            }}
          >
            <div
              style={{ position: 'relative', width: '100%', height: '400px' }}
            >
              <Cropper
                image={popupImage}
                crop={serialCrop}
                zoom={serialZoom}
                aspect={1}
                onCropChange={setSerialCrop}
                onZoomChange={setSerialZoom}
                onCropComplete={onSerialCropComplete}
              />
            </div>

            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button
                onClick={async () => {
                  const croppedBlob = await getCroppedImg(
                    popupImage,
                    serialCroppedAreaPixels,
                  );

                  const previewUrl = URL.createObjectURL(croppedBlob);
                  setSerialNumberImage(previewUrl);

                  setIsCropPopupOpen(false);
                  setPopupImage('');
                }}
              >
                Confirm
              </button>

              <button
                onClick={() => {
                  setIsCropPopupOpen(false);
                  setPopupImage('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {serialNumberImage && (
        <div
          {...getRootProps()}
          style={{ cursor: 'pointer', display: 'inline-block' }}
        >
          <input {...getInputProps()} />
          <img
            src={serialNumberImage}
            alt='Cropped'
            style={{ width: 400, borderRadius: 8 }}
          />
        </div>
        )}
        </div>
    </div>
  );

}

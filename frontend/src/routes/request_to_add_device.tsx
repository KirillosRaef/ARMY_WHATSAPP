import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import Select, { type SingleValue } from 'react-select';
import { useQuery } from '@tanstack/react-query';
import ImageUploadCrop from '../components/image_upload_crop';
import { Button } from '@/components/ui/button';

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


  const [serialNumberBlob, setSerialNumberBlob] = useState<Blob>(new Blob());
  const [devicePhotoBlob, setDevicePhotoBlob] = useState<Blob>(new Blob());

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

      <div className='grid grid-cols-2 gap-8'>
        <ImageUploadCrop
          title='Serial Number Image'
          label='Upload Serial Number Image'
          aspect={1}
          onImageCropped={setSerialNumberBlob}
        />

        <ImageUploadCrop
          title='Device Image'
          label='Upload Device Image'
          aspect={1}
          onImageCropped={setDevicePhotoBlob}
        />
      </div>
      <Button onClick={() => {
        console.log('Submitting request:', {
          selectedDeviceType,
          serialNumber,
          selectedUsage,
          serialNumberBlob,
          devicePhotoBlob,
        });
      }}>Submit Request</Button>
    </div>
  );

}

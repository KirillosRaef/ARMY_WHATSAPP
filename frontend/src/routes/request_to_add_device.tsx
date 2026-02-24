import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import Select, { type SingleValue } from 'react-select';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

export const Route = createFileRoute('/request_to_add_device')({
  component: RouteComponent,
})

type Option = { value: string; label: string };

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
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
  //TODO: Add divs to get the deviceId (dropdown search with values from deviceType),
  //TODO: serialNumber (text), and usage (dropdown enum) 
  //TODO: with two pictures, serialNumber, and devicePhoto
  //
  //TODO: button to add this request to the requests table *IF* all values inserted
  const [selectedOption, setSelectedOption] = useState<SingleValue<Option>>({value: '', label: 'Select an option'});
  // const [selectedDeviceType, setSelectedDeviceType] =
  //   useState<SingleValue<Option>>({value: '', label: 'Select device type'});

  // const {
  //   data: deviceTypes,
  //   isLoading,
  //   error,
  // } = useQuery({
  //   queryKey: ['deviceTypes'],
  //   queryFn: getDeviceTypes,
  //   staleTime: 5 * 60 * 1000,
  //   gcTime: 10 * 60 * 1000,
  // });
  const getDeviceTypes = async () => {
    const res = await fetch('http://localhost:5173/api/device-types', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const data = await res.json();
    // setDeviceTypes(data);
    console.log('Response:', data);
    return data;
  };

  if (typeof window !== 'undefined') {
    getDeviceTypes();
  }

  return (
    
    <div >
      <Select
        defaultValue={selectedOption}
        onChange={(newValue) => setSelectedOption(newValue)}
        options={options}
      />
    </div>
  );

}

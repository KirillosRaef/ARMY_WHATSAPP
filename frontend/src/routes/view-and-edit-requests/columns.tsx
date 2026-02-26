'use client';

import type { ColumnDef } from '@tanstack/react-table';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type RequestModifiedType = {
  id: string;
  deviceTypeId: string;
  serialNumber: string;
  usage: string;
  devicePhoto: string;
  serialNumberPhoto: string;
  deviceDescription: string;
};

const DEVICE_URL = 'http://localhost:5173/api/image/devices';
const SERIAL_NUMBER_URL = 'http://localhost:5173/api/image/serial-numbers';

export const columns: ColumnDef<RequestModifiedType>[] = [
  {
    accessorKey: 'deviceDescription',
    header: 'Device Description',
  },
  {
    accessorKey: 'serialNumber',
    header: 'Serial Number',
  },
  {
    accessorKey: 'usage',
    header: 'Usage',
  },
  {
    accessorKey: 'devicePhoto',
    header: 'Device Photo',
    cell: ({ row }) => {
      const fileName = row.original.devicePhoto;

      return (
        <img
          src={`${DEVICE_URL}/${fileName}`}
          alt='Device'
          width={150}
          height={150}
          className='w-10 h-10 object-cover rounded-md border'
          loading='lazy'
        />
      );
    },
  },
  {
    accessorKey: 'serialNumberPhoto',
    header: 'Serial Number Photo',
    cell: ({ row }) => {
      const fileName = row.original.devicePhoto;

      return (
        <img
          src={`${SERIAL_NUMBER_URL}/${fileName}`}
          alt='Serial Number'
          width={150}
          height={150}
          className='w-10 h-10 object-cover rounded-md border'
          loading='lazy'
        />
      );
    },
  },
];

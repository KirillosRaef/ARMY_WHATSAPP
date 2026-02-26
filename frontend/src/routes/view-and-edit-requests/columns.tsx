'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
// import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';



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
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
  },
  {
    id: 'id',
    accessorKey: 'id',
    header: 'ID',
    enableHiding: true,
  },
  {
    accessorKey: 'deviceDescription',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Device Description
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
  },
  {
    accessorKey: 'serialNumber',
    header: 'Serial Number',
  },
  {
    accessorKey: 'usage',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Usage
          {/* <ArrowUpDown className='ml-2 h-4 w-4' /> */}
        </Button>
      );
    },
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

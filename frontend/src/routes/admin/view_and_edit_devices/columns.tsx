'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import ViewImage from '@/components/view_image';

export type DeviceModifiedType = {
  id: string;
  deviceTypeId: string;
  brandLogo: string;
  brandName: string;
  deviceKind: string;
  description: string;
  serialNumber: string;
  usage: string;
  devicePhoto: string;
  serialNumberPhoto: string;
};

const DEVICE_URL = 'http://localhost:5173/api/image/devices';
const SERIAL_NUMBER_URL = 'http://localhost:5173/api/image/serial-numbers';
const LOGO_URL = 'http://localhost:5173/api/image/logos';

function UsageBadge({ usage }: { usage: string }) {
  const map: Record<string, { label: string; className: string }> = {
    New: {
      label: '✨ New',
      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    },
    Used: {
      label: '🔄 Used',
      className: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    },
    Broken: {
      label: '⚠️ Broken',
      className: 'bg-red-500/15 text-red-400 border-red-500/20',
    },
  };

  const config = map[usage] ?? { label: usage, className: 'bg-muted text-muted-foreground border-border' };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

export const columns: ColumnDef<DeviceModifiedType>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary translate-y-[2px]"
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
    accessorKey: 'brandName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-3 font-semibold text-muted-foreground hover:text-foreground h-auto px-3 py-1.5 uppercase tracking-wider text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Brand
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium text-foreground/90 flex items-center gap-2">
      <img
        src={`${LOGO_URL}/${row.original.brandLogo}`}
        alt="Logo"
        className="w-10 h-10 object-cover rounded-lg border border-white/10 shadow-sm"
        loading="lazy"
      />
      {row.original.brandName}
    </div>,
  },
  {
    accessorKey: 'deviceKind',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-3 font-semibold text-muted-foreground hover:text-foreground h-auto px-3 py-1.5 uppercase tracking-wider text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Device Type
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <code className="rounded-md bg-muted/50 px-1.5 py-0.5 text-xs font-mono text-foreground/80">
        {row.original.deviceKind}
      </code>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-3 font-semibold text-muted-foreground hover:text-foreground h-auto px-3 py-1.5 uppercase tracking-wider text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Description
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <code className="rounded-md bg-muted/50 px-1.5 py-0.5 text-xs font-mono text-foreground/80">
        {row.original.description}
      </code>
    ),
  },
  {
    accessorKey: 'serialNumber',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-3 font-semibold text-muted-foreground hover:text-foreground h-auto px-3 py-1.5 uppercase tracking-wider text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Serial Number
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <code className="rounded-md bg-muted/50 px-1.5 py-0.5 text-xs font-mono text-foreground/80">
        {row.original.serialNumber}
      </code>
    ),
  },
  {
    accessorKey: 'usage',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-3 font-semibold text-muted-foreground hover:text-foreground h-auto px-3 py-1.5 uppercase tracking-wider text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Condition
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex">
        <UsageBadge usage={row.original.usage} />
      </div>
    ),
  },
  {
    accessorKey: 'devicePhoto',
    header: () => (
      <span className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Device Photo</span>
    ),
    cell: ({ row }) => {
      const fileName = row.original.devicePhoto;
      return (
        <ViewImage src={`${DEVICE_URL}/${fileName}`} alt="Device" />
      );
    },
  },
  {
    accessorKey: 'serialNumberPhoto',
    header: () => (
      <span className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Serial Photo</span>
    ),
    cell: ({ row }) => {
      const fileName = row.original.serialNumberPhoto;
      return (
        <ViewImage src={`${SERIAL_NUMBER_URL}/${fileName}`} alt="Serial Number" />
      );
    },
  },
];

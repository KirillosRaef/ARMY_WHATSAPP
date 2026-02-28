'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

export type DeviceType = {
  id: string;
  brandName: string;
  deviceKind: string;
  description: string;
  brandLogo: string;
}

const LOGO_URL = 'http://localhost:5173/api/image/logos';

export const columns: ColumnDef<DeviceType>[] = [
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
    accessorKey: 'brandLogo',
    header: () => (
      <span className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Brand Logo</span>
    ),
    cell: ({ row }) => {
      const fileName = row.original.brandLogo;
      return (
        <img
          src={`${LOGO_URL}/${fileName}`}
          alt="Logo"
          className="w-10 h-10 object-cover rounded-lg border border-white/10 shadow-sm"
          loading="lazy"
        />
      );
    },
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
        Brand Name
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <code className="rounded-md bg-muted/50 px-1.5 py-0.5 text-xs font-mono text-foreground/80">
        {row.original.brandName}
      </code>
    ),
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
        Device Kind
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
];

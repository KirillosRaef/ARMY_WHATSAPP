'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

export type MilitaryUnitType = {
  id: string;
  militaryUnitName: string;
  branch: string;
}

export const columns: ColumnDef<MilitaryUnitType>[] = [
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
    accessorKey: 'militaryUnitName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-3 font-semibold text-muted-foreground hover:text-foreground h-auto px-3 py-1.5 uppercase tracking-wider text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Military Unit Name
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <code className="rounded-md bg-muted/50 px-1.5 py-0.5 text-xs font-mono text-foreground/80">
        {row.original.militaryUnitName}
      </code>
    ),
  },
  {
    accessorKey: 'branch',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-3 font-semibold text-muted-foreground hover:text-foreground h-auto px-3 py-1.5 uppercase tracking-wider text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Branch
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <code className="rounded-md bg-muted/50 px-1.5 py-0.5 text-xs font-mono text-foreground/80">
        {row.original.branch}
      </code>
    ),
  },
];

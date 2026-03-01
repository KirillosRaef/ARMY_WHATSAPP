'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import ViewImage from '@/components/view_image';

export type DeviceType = {
  id: string;
  brandName: string;
  deviceKind: string;
  description: string;
  brandLogo: string;
};

const LOGO_URL = 'http://localhost:5173/api/image/logos';

export function useDeviceTypeColumns(): ColumnDef<DeviceType>[] {
  const { t } = useTranslation();
  return useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label={t('common.selectAll')}
            className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t('common.selectRow')}
            className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary translate-y-[2px]"
          />
        ),
      },
      {
        id: 'id',
        accessorKey: 'id',
        header: t('table.id'),
        enableHiding: true,
      },
      {
        accessorKey: 'brandLogo',
        header: () => (
          <span className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">{t('table.brandLogo')}</span>
        ),
        cell: ({ row }) => {
          const fileName = row.original.brandLogo;
          return (
            <ViewImage src={`${LOGO_URL}/${fileName}`} alt={t('table.brandLogo')} />
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
            {t('table.brandName')}
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
            {t('table.deviceKind')}
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
            {t('table.description')}
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <code className="rounded-md bg-muted/50 px-1.5 py-0.5 text-xs font-mono text-foreground/80">
            {row.original.description}
          </code>
        ),
      },
    ],
    [t]
  );
}

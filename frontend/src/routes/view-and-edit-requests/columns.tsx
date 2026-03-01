'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import ViewImage from '@/components/view_image';

export type RequestModifiedType = {
  id: string;
  brandLogo: string;
  deviceDescription: string;
  deviceTypeId: string;
  militaryUnitId: string;
  serialNumber: string;
  usage: string;
  militaryUnitName: string;
  branch: string;
  username: string;
  devicePhoto: string;
  serialNumberPhoto: string;
};

const DEVICE_URL = 'http://localhost:5173/api/image/devices';
const SERIAL_NUMBER_URL = 'http://localhost:5173/api/image/serial-numbers';
const LOGO_URL = 'http://localhost:5173/api/image/logos';

function UsageBadge({ usage }: { usage: string }) {
  const { t } = useTranslation();
  const map: Record<string, { labelKey: string; className: string }> = {
    New: { labelKey: 'usageBadge.new', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    Used: { labelKey: 'usageBadge.used', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    Broken: { labelKey: 'usageBadge.broken', className: 'bg-red-500/15 text-red-400 border-red-500/20' },
  };
  const config = map[usage] ?? { labelKey: usage, className: 'bg-muted text-muted-foreground border-border' };
  const label = config.labelKey in map ? t(config.labelKey) : usage;
  return (
    <Badge variant="outline" className={config.className}>
      {label}
    </Badge>
  );
}

export function useRequestColumns(): ColumnDef<RequestModifiedType>[] {
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
        accessorKey: 'deviceDescription',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 -ml-3 font-semibold text-muted-foreground hover:text-foreground h-auto px-3 py-1.5 uppercase tracking-wider text-xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('table.device')}
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium text-foreground/90 flex items-center gap-2">
            <img
              src={`${LOGO_URL}/${row.original.brandLogo}`}
              alt={t('table.brandLogo')}
              className="w-10 h-10 object-cover rounded-lg border border-white/10 shadow-sm"
              loading="lazy"
            />
            {row.original.deviceDescription}
          </div>
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
            {t('table.serialNumber')}
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
            {t('table.usage')}
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
        accessorKey: 'militaryUnitName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 -ml-3 font-semibold text-muted-foreground hover:text-foreground h-auto px-3 py-1.5 uppercase tracking-wider text-xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('table.militaryUnit')}
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
            {t('table.branch')}
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <code className="rounded-md bg-muted/50 px-1.5 py-0.5 text-xs font-mono text-foreground/80">
            {row.original.branch}
          </code>
        ),
      },
      {
        accessorKey: 'username',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 -ml-3 font-semibold text-muted-foreground hover:text-foreground h-auto px-3 py-1.5 uppercase tracking-wider text-xs"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('table.username')}
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <code className="rounded-md bg-muted/50 px-1.5 py-0.5 text-xs font-mono text-foreground/80">
            {row.original.username}
          </code>
        ),
      },
      {
        accessorKey: 'devicePhoto',
        header: () => (
          <span className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">{t('table.devicePhoto')}</span>
        ),
        cell: ({ row }) => {
          const fileName = row.original.devicePhoto;
          return (
            <ViewImage src={`${DEVICE_URL}/${fileName}`} alt={t('table.device')} />
          );
        },
      },
      {
        accessorKey: 'serialNumberPhoto',
        header: () => (
          <span className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">{t('table.serialNumberPhoto')}</span>
        ),
        cell: ({ row }) => {
          const fileName = row.original.serialNumberPhoto;
          return (
            <ViewImage src={`${SERIAL_NUMBER_URL}/${fileName}`} alt={t('table.serialNumber')} />
          );
        },
      },
    ],
    [t]
  );
}

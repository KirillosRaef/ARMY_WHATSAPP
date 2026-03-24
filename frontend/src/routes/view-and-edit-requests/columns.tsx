'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Building2, User } from 'lucide-react';
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
            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t('common.selectRow')}
            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary translate-y-[2px]"
          />
        ),
        size: 40,
      },
      {
        id: 'id',
        accessorKey: 'id',
        header: t('table.id'),
        enableHiding: true,
      },
      // ─── Device (with logo) ───
      {
        accessorKey: 'deviceDescription',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 -ml-2 font-semibold text-muted-foreground hover:text-foreground h-auto px-2 py-1.5 uppercase tracking-wider text-[11px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('table.device')}
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={`${LOGO_URL}/${row.original.brandLogo}`}
              alt={t('table.brandLogo')}
              className="w-9 h-9 object-contain rounded-lg p-0.5 shrink-0"
              loading="lazy"
            />
            <p className="text-sm font-medium text-foreground truncate">{row.original.deviceDescription}</p>
          </div>
        ),
      },
      // ─── Serial + Usage ───
      {
        id: 'serial',
        accessorKey: 'serialNumber',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 -ml-2 font-semibold text-muted-foreground hover:text-foreground h-auto px-2 py-1.5 uppercase tracking-wider text-[11px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('table.serialNumber')}
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1.5">
            <code className="rounded bg-muted/50 px-1.5 py-0.5 text-[11px] font-mono text-foreground/80 truncate max-w-[140px] block">
              {row.original.serialNumber}
            </code>
            <UsageBadge usage={row.original.usage} />
          </div>
        ),
      },
      // ─── Unit + Branch + Username ───
      {
        id: 'unit',
        accessorKey: 'militaryUnitName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 -ml-2 font-semibold text-muted-foreground hover:text-foreground h-auto px-2 py-1.5 uppercase tracking-wider text-[11px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('table.unit')}
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground/90 truncate">{row.original.militaryUnitName}</span>
            </div>
            {row.original.branch && (
              <span className="text-[11px] text-muted-foreground truncate ps-[18px]">{row.original.branch}</span>
            )}
            <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
              <User className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground/70 truncate">{row.original.username}</span>
            </div>
          </div>
        ),
      },
      // ─── Photos ───
      {
        id: 'photos',
        header: () => (
          <span className="text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">{t('table.photos')}</span>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <ViewImage
              src={`${DEVICE_URL}/${row.original.devicePhoto}`}
              alt={t('table.photo')}
              imageClassName="w-10 h-10 object-cover rounded-lg border border-border/50 shadow-sm"
            />
            <ViewImage
              src={`${SERIAL_NUMBER_URL}/${row.original.serialNumberPhoto}`}
              alt={t('table.snPhoto')}
              imageClassName="w-10 h-10 object-cover rounded-lg border border-border/50 shadow-sm"
            />
          </div>
        ),
      },
    ],
    [t]
  );
}

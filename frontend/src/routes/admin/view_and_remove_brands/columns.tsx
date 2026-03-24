'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ViewImage from '@/components/view_image';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export type Brands = {
  brandName: string;
};

const LOGO_URL = 'http://localhost:5173/api/image/logos';

export function useBrandColumns(): ColumnDef<Brands>[] {
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
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={t('common.selectRow')}
          />
        ),
      },
      {
        id: 'brandLogo',
        accessorKey: 'brandLogo',
        header: t('table.brandLogo'),
        cell: ({ row }) => {
          const fileName = row.original.brandName;
          return (
            <div className="flex justify-end pr-8">
              <ViewImage
                src={`${LOGO_URL}/${fileName}`}
                alt={t('table.brandLogo')}
                imageClassName="w-16 h-16 sm:w-24 sm:h-24 object-contain rounded-[14px] border border-black/[0.04] dark:border-white/10 bg-gradient-to-br from-black/[0.01] to-black/[0.04] dark:from-white/[0.02] dark:to-white/[0.06] backdrop-blur-sm p-2 hover:scale-105 transition-all duration-300 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.2)]"
              />
            </div>
          );
        },
      },
      {
        id: 'brandName',
        accessorKey: 'brandName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 font-semibold text-muted-foreground hover:text-foreground h-auto px-3 py-1.5 uppercase tracking-wider text-xs w-full justify-start pl-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {t('table.brandName')}
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const fileName = row.original.brandName;
          return (
            <div className="flex justify-start pl-8">
              <code className="rounded-md bg-muted/50 px-3 py-1.5 text-sm font-mono text-foreground/80 font-semibold shadow-sm border border-border/40">
                {fileName.split('.')[0].charAt(0).toUpperCase() + fileName.split('.')[0].slice(1)}
              </code>
            </div>
          );
        },
      },
    ],
    [t]
  );
}

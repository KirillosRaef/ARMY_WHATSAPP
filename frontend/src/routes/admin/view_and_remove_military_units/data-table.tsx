'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, AlertTriangle, Building2, GitBranch } from 'lucide-react';

const deleteSelection = async (ids: string[]) => {
  await fetch('http://localhost:5173/api/military-units-id', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ militaryUnitIds: ids }),
  });
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends { id: string; militaryUnitName: string; branch: string }, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [isDeleting, setIsDeleting] = React.useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { sorting, rowSelection },
    initialState: { columnVisibility: { id: false }, pagination: { pageSize: 12 } },
  });

  const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id);
  const selectedCount = selectedIds.length;

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      await deleteSelection(selectedIds);
      window.location.reload();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label={t('common.selectAll')}
            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <span className="text-sm text-muted-foreground">
            {t('table.rowsSelected', {
              count: table.getFilteredSelectedRowModel().rows.length,
              total: table.getFilteredRowModel().rows.length,
            })}
          </span>
        </div>

        {selectedCount > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 animate-fade-in bg-destructive/15 text-red-500 hover:bg-destructive/30 hover:text-red-400 border border-destructive/20 h-9 rounded-lg px-4 transition-all"
          >
            {isDeleting ? (
              <>
                <div className="h-3.5 w-3.5 rounded-full border-2 border-red-500/40 border-t-red-500 animate-spin" />
                {t('table.deleting')}
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                {t('table.deleteSelected', { count: selectedCount })}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Card Grid */}
      {table.getRowModel().rows?.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {table.getRowModel().rows.map((row) => {
            const isSelected = row.getIsSelected();
            return (
              <Card
                key={row.id}
                className={[
                  'group relative p-4 cursor-pointer border transition-all duration-300 overflow-hidden',
                  isSelected
                    ? 'border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/30 hover:shadow-md dark:hover:bg-white/[0.02]',
                ].join(' ')}
                onClick={() => row.toggleSelected(!isSelected)}
              >
                {/* Selection glow */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5 pointer-events-none" />
                )}

                <div className="relative z-10 flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={t('common.selectRow')}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-semibold text-foreground truncate">
                        {row.original.militaryUnitName}
                      </span>
                    </div>
                    {row.original.branch && row.original.branch !== '-' && (
                      <div className="flex items-center gap-1.5 ps-0.5">
                        <GitBranch className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                          {row.original.branch}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 opacity-40" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground/60">{t('table.noMilitaryUnitsFound')}</p>
            <p className="text-xs mt-0.5">{t('table.noDataSubmitMilitaryUnit')}</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground text-sm">
          {t('table.rowsSelected', {
            count: table.getFilteredSelectedRowModel().rows.length,
            total: table.getFilteredRowModel().rows.length,
          })}
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl px-5 py-2 text-sm font-medium h-9 border-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t('table.previous')}
          </Button>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {t('table.pageOf', {
              page: table.getState().pagination.pageIndex + 1,
              total: table.getPageCount(),
            })}
          </span>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl px-5 py-2 text-sm font-medium h-9 border-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t('table.next')}
          </Button>
        </div>
      </div>
    </div>
  );
}

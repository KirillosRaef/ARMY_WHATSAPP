'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
  getPaginationRowModel,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Trash2, AlertTriangle } from 'lucide-react';



const deleteSelection = async (ids: string[]) => {
  const delRes = await fetch('http://localhost:5173/api/devices', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ deviceIds: ids }),
  });
  if (!delRes.ok) throw new Error('Failed to delete selected devices');
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, rowSelection, columnFilters },
    initialState: { columnVisibility: { id: false } },
  });

  const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id);
  const selectedCount = selectedIds.length;

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);
    try {
      // console.log("selectedIds", selectedIds);
      await deleteSelection(selectedIds);
      window.location.reload();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">

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

      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder={t('table.filterBrandName')}
          value={(table.getColumn("brandName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("brandName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder={t('table.filterDeviceType')}
          value={(table.getColumn("deviceKind")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("deviceKind")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder={t('table.filterDescription')}
          value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder={t('table.filterSerialNumber')}
          value={(table.getColumn("serialNumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("serialNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Input
          placeholder={t('table.filterUsage')}
          value={(table.getColumn("usage")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("usage")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {/* <div className="space-y-3">
              <Label className="max-w-sm w-full text-foreground font-medium text-sm">Condition Status</Label>
              <Select
                onValueChange={(value) => {
                setSelectedUsage({
                  value,
                  label: usageOptions.find((option) => option.value === value)!.label
                })
              
              if (value == selectedUsage?.value) {
                  console.log("value === selectedUsage?.value")
                  table.getColumn("usage")?.setFilterValue(null);
                } else {
                  table.getColumn("usage")?.setFilterValue(value);
                }
              }}>
                <SelectTrigger className="w-full border-white/10 bg-black/20 focus:ring-primary h-11 rounded-xl transition-all">
                  <SelectValue placeholder={t('table.filterCondition')} />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#121212] rounded-xl shadow-xl">
                  <SelectGroup>
                    {usageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="rounded-lg focus:bg-white/5 my-0.5 cursor-pointer">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div> */}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card p-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-border bg-muted/20 hover:bg-muted/20"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground text-xs font-semibold uppercase tracking-wider h-12 px-4"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={[
                    'border-b border-white/5 transition-colors',
                    row.getIsSelected()
                      ? 'bg-primary/8 hover:bg-primary/12'
                      : 'hover:bg-white/3',
                  ].join(' ')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-4 align-middle text-sm text-foreground/90">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 opacity-40" />
                    <div>
                      <p className="text-sm font-medium text-foreground/60">No requests found</p>
                      <p className="text-xs mt-0.5">{t('table.noDataSubmitDevice')}</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-3 py-3 px-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground text-sm">
          {t('table.rowsSelected', {
            count: table.getFilteredSelectedRowModel().rows.length,
            total: table.getFilteredRowModel().rows.length,
          })}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl px-5 py-2 text-sm font-medium h-9 border-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t('table.previous')}
          </Button>
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

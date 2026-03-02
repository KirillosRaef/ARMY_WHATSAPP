"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}


const deleteSelection = async (brands: string[]) => {
  const res = await fetch('http://localhost:5173/api/image/logos', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ brands: brands }),
  });
  console.log('brands: ', brands);
  if (!res.ok) throw new Error('Failed to delete selected requests');
};

export function DataTable<TData extends { brandName: string }, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation()
  const [rowSelection, setRowSelection] = React.useState({})
  const [isDeleting, setIsDeleting] = React.useState(false);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      rowSelection,
    },
  })
  const selectedBrands = table.getSelectedRowModel().rows.map((row) => row.original.brandName);
  const selectedCount = selectedBrands.length;

  const handleDelete = async () => {
    if (selectedBrands.length === 0) return;
    setIsDeleting(true);
    try {
      await deleteSelection(selectedBrands);
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
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete {selectedCount} selected
              </>
            )}
          </Button>
        )}
      </div>
      <div className="rounded-xl border border-border overflow-hidden bg-card p-0">
        <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b border-border bg-muted/20 hover:bg-muted/20">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
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
  )
}
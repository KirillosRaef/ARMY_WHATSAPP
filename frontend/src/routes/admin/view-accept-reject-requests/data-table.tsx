'use client';

import * as React from 'react';
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
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
import { Trash2, AlertTriangle, Check } from 'lucide-react';

const deleteSelection = async (ids: string[]) => {
  const delRes = await fetch('http://localhost:5173/api/requests', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ requestIds: ids }),
  });
  if (!delRes.ok) throw new Error('Failed to delete selected requests');
};

const acceptSelection = async (ids: string[]) => {
  deleteSelection(ids);
  const accRes = await fetch('http://localhost:5173/api/accept-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ requestIds: ids }),
  });
  // if (!accRes.ok) throw new Error('Failed to accept selected requests');
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isAccepting, setIsAccepting] = React.useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { sorting, rowSelection },
    initialState: { columnVisibility: { id: false } },
  });

  const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id);
  const selectedCount = selectedIds.length;
  const totalCount = table.getFilteredRowModel().rows.length;

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

  const handleAccept = async () => {
    if (selectedIds.length === 0) return;
    setIsAccepting(true);
    try {
      await acceptSelection(selectedIds);
      window.location.reload();
    } finally {
      setIsAccepting(false);
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
        {selectedCount > 0 && (
          <Button
            variant="default"
            size="sm"
            onClick={handleAccept}
            disabled={isAccepting}
            className="gap-2 animate-fade-in bg-green-500/15 text-green-500 hover:bg-green-500/30 hover:text-green-400 border border-green-500/20 h-9 rounded-lg px-4 transition-all"
          >
            {isAccepting ? (
              <>
                <div className="h-3.5 w-3.5 rounded-full border-2 border-green-500/40 border-t-green-500 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Accept {selectedCount} selected
              </>
            )}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/8 overflow-hidden glass-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-white/10 bg-black/40 hover:bg-black/40"
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
                      <p className="text-xs mt-0.5">Submit a new device request to get started</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-muted-foreground flex-1 text-sm">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
    </div>
  );
}

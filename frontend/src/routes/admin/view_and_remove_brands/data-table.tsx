import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import React from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, AlertTriangle, Image as ImageIcon, Sparkles } from "lucide-react"
import ViewImage from "@/components/view_image"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

const LOGO_URL = 'http://localhost:5173/api/image/logos';

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
  const isAllSelected = table.getIsAllPageRowsSelected();
  const isSomeSelected = table.getIsSomePageRowsSelected();

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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-3 pl-2">
          <Checkbox
            checked={isAllSelected || (isSomeSelected && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label={t('common.selectAll')}
            id="select-all"
          />
          <label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground select-none">
            {t('common.selectAll') || 'Select All'}
          </label>
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
                {t('table.deleting') || 'Deleting...'}
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                {t('table.deleteSelected', { count: selectedCount }) || `Delete ${selectedCount} selected`}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const fileName = row.original.brandName;
            const displayName = fileName.split('.')[0].charAt(0).toUpperCase() + fileName.split('.')[0].slice(1);
            const isSelected = row.getIsSelected();

            return (
              <Card
                key={row.id}
                className={`group relative flex flex-col overflow-hidden cursor-pointer backdrop-blur-md transition-all duration-500 ease-out transform ${
                  isSelected 
                    ? 'ring-2 ring-primary border-primary bg-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.2)] scale-[1.02]' 
                    : 'border-white/10 glass-card hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1'
                }`}
                onClick={() => row.toggleSelected()}
              >
                {/* Animated Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-700 pointer-events-none ${isSelected ? 'opacity-100' : 'group-hover:opacity-50'}`} />
                
                {/* Glow behind image */}
                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/20 rounded-full blur-2xl transition-opacity duration-500 pointer-events-none ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />

                {/* Checkbox overlay */}
                <div className="absolute top-3 right-3 z-10 transition-all duration-300" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={t('common.selectRow')}
                    className={`transition-all duration-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`}
                  />
                </div>

                <CardContent className="flex flex-col items-center justify-center p-6 gap-5 relative z-0 h-full">
                  <div 
                    className="flex-1 flex items-center justify-center w-full" 
                    onClick={() => {
                      // Prevent toggling selection when clicking the view image button (except it's handled in ViewImage)
                    }}
                  >
                    <div className={`relative flex items-center justify-center transition-all duration-500 will-change-transform ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                      <ViewImage
                        src={`${LOGO_URL}/${fileName}`}
                        alt={displayName}
                        imageClassName={`w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl border transition-all duration-500 shadow-xl ${isSelected ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-white/5 group-hover:border-primary/30'} p-3`}
                        isClickable={false}
                      />
                    </div>
                  </div>
                  
                  <div className="w-full text-center mt-auto pt-3 border-t border-border/40 relative">
                    <code className={`rounded-lg px-3 py-1.5 text-sm font-mono font-semibold truncate max-w-full inline-block transition-colors duration-300 ${isSelected ? 'bg-primary/20 text-primary-foreground' : 'bg-muted/30 text-foreground/90 group-hover:bg-muted/50'}`}>
                      {displayName}
                    </code>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl bg-gradient-to-b from-card/30 to-background">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl animate-pulse" />
              <div className="h-16 w-16 rounded-full bg-card border border-white/5 flex items-center justify-center relative shadow-xl">
                <ImageIcon className="h-7 w-7 text-primary/70 mb-1 ml-1" />
                <Sparkles className="h-4 w-4 text-amber-400 absolute top-2 right-2 animate-bounce" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-foreground/90">No brands found</p>
              <p className="text-sm text-foreground/50 max-w-sm">There are currently no brands available in the system. Add some brands to see them here.</p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 py-3 px-1 sm:flex-row sm:items-center sm:justify-between">
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
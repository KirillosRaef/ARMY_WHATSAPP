"use client"

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ViewImage from "@/components/view_image";
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Brands = {
  brandName: string
}

const LOGO_URL = 'http://localhost:5173/api/image/logos';

export const columns: ColumnDef<Brands>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    id: "brandLogo",
    accessorKey: "brandLogo",
    header: "Brand Logo",
    cell: ({ row }) => {
      const fileName = row.original.brandName;
      return (
        <ViewImage src={`${LOGO_URL}/${fileName}`} alt="Brand Logo" />
      );
    },
  },
  {
    id: "brandName",
    accessorKey: "brandName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 -ml-3 font-semibold text-muted-foreground hover:text-foreground h-auto px-3 py-1.5 uppercase tracking-wider text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Brand Name
        <ArrowUpDown className="h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const fileName = row.original.brandName;
      return (
        // TODO: REMOVE THE CAPITALIZED LETTER IF NEEDED
        <code className="rounded-md bg-muted/50 px-1.5 py-0.5 text-xs font-mono text-foreground/80">
          {fileName.split('.')[0].charAt(0).toUpperCase() + fileName.split('.')[0].slice(1)}
        </code>
      );
    },
  }
]
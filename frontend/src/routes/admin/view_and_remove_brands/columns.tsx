"use client"

import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table"

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
    id: "brandName",
    accessorKey: "brandName",
    header: "Brand Name",
    cell: ({ row }) => {
      const fileName = row.original.brandName;
      return (
        <img
          src={`${LOGO_URL}/${fileName}`}
          alt="Brand Logo"
          className="w-10 h-10 object-cover rounded-lg border border-white/10 shadow-sm"
          loading="lazy"
        />
      );
    },
  },
]
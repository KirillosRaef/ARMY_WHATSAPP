import { createFileRoute } from '@tanstack/react-router'
import { columns, type Brands } from "./columns"
import { DataTable } from "./data-table"
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app_shell';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';


export const Route = createFileRoute('/admin/view_and_remove_brands/page')({
  component: RouteComponent,
})

const getBrands = async () => {
  const brandsResponse = await fetch('http://localhost:5173/api/image/logos');
  if (!brandsResponse.ok) {
    throw new Error('Failed to fetch brands');
  }
  const data = await brandsResponse.json();
  const brands = data.map((brand: string) => ({
    brandName: brand,
  }));
  return brands;
}


function RouteComponent() {
  const { data: brands, isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });
  
  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-8 max-w-7xl mx-auto w-full animate-fade-in">
          <div className="flex flex-col gap-2 pb-6 border-b border-white/5">
            <Skeleton className="h-8 w-48 mb-2 rounded" />
            <Skeleton className="h-4 w-72 rounded" />
          </div>
          <div className="rounded-2xl border border-white/10 glass-card overflow-hidden">
            <div className="bg-white/5 p-4 border-b border-white/5">
              <Skeleton className="h-4 w-full rounded" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 p-4 border-b border-white/5">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    );

  }
  if (error) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-lg font-semibold text-foreground">Failed to load requests</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        </div>
      </AppShell>
    );
  }
  return (
    <div className="container mx-auto py-10">
      
      <AppShell>
        <DataTable columns={columns} data={brands} />
      </AppShell>
    </div>
  )
}
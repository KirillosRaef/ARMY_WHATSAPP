import { createFileRoute } from '@tanstack/react-router'
import { useBrandColumns } from './columns';
import { DataTable } from "./data-table"
import { useQuery } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin_shell';
import LoadingComponent from '@/components/helpers/loading_component';
import ErrorComponent from '@/components/helpers/error_component';


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
  const columns = useBrandColumns();
  const { data: brands, isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });
  
  if (isLoading) {
      return <LoadingComponent shell='Admin' />;
    }
  
    if (error) {
      return <ErrorComponent error={error} shell='Admin' />;
    }
  return (
    <div className="container mx-auto py-10">
      
      <AdminShell>
        <DataTable columns={columns} data={brands} />
      </AdminShell>
    </div>
  )
}
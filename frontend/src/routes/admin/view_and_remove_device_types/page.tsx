import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { columns, type DeviceType } from './columns';
import { DataTable } from './data-table';
import { AdminShell } from '@/components/admin_shell';
import ErrorComponent from '@/components/helpers/error_component';
import LoadingComponent from '@/components/helpers/loading_component';
import { ClipboardList } from 'lucide-react';

export const Route = createFileRoute(
  '/admin/view_and_remove_device_types/page'
)({
  component: RouteComponent,
});

const getDeviceTypes = async () => {
  const deviceTypes = await fetch('http://localhost:5173/api/device-types');
  if (!deviceTypes.ok) throw new Error('Failed to fetch device types'); 
  const data = await deviceTypes.json();
  return data;
};

function RouteComponent() {
  const {
    data: deviceTypes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['deviceTypes'],
    queryFn: getDeviceTypes as () => Promise<DeviceType[]>,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });

  if (isLoading) {
    return <LoadingComponent shell='Admin' />
  }

  if (error) {
    return <ErrorComponent error={error} shell='Admin' />
  }

  return (
    <AdminShell>
      <div className="space-y-8 max-w-7xl mx-auto w-full animate-slide-up">
        <div className="flex flex-col gap-2 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 flex-shrink-0 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Active Records</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {deviceTypes?.length
                  ? `${deviceTypes.length} authorized request${deviceTypes.length !== 1 ? 's' : ''} found in your log`
                  : 'No active records found targeting your clearance'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl border-white/10 shadow-2xl overflow-hidden">
          <DataTable columns={columns} data={deviceTypes || []} />
        </div>
      </div>
    </AdminShell>
  );
}

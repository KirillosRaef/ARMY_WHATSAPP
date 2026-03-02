import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useDeviceColumns, type DeviceModifiedType } from './columns';
import { DataTable } from './data-table';
import { AdminShell } from '../../../components/admin_shell';
import { ClipboardList } from 'lucide-react';
import LoadingComponent from '@/components/helpers/loading_component';
import ErrorComponent from '@/components/helpers/error_component';

export const Route = createFileRoute(
  '/admin/view_and_edit_devices/page'
)({
  component: RouteComponent,
});

const getDevices = async () => {
  const res = await fetch(
    `http://localhost:5173/api/devices-with-description`
  );
  if (!res.ok) throw new Error('Failed to fetch devices');
  const data = await res.json();
  console.log('Devices response:', data);
  return data;
};

function RouteComponent() {
  const { t } = useTranslation();
  const columns = useDeviceColumns();
  const {
    data: devices,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['devices'],
    queryFn: getDevices as () => Promise<DeviceModifiedType[]>,
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
      <div className="space-y-6 max-w-7xl mx-auto w-full animate-slide-up">
        <div className="flex flex-col gap-2 pb-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 flex-shrink-0 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('pages.activeRecords')}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {devices?.length
                  ? t('pages.authorizedDevicesFound', { count: devices.length })
                  : t('pages.noActiveRecords')}
              </p>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={devices || []} />
      </div>
    </AdminShell>
  );
}

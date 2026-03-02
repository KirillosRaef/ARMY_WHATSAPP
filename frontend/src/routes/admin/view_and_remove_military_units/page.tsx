import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useMilitaryUnitColumns, type MilitaryUnitType } from './columns';
import { DataTable } from './data-table';
import { AdminShell } from '@/components/admin_shell';
import ErrorComponent from '@/components/helpers/error_component';
import LoadingComponent from '@/components/helpers/loading_component';
import { ClipboardList } from 'lucide-react';

export const Route = createFileRoute(
  '/admin/view_and_remove_military_units/page'
)({
  component: RouteComponent,
});

const getMilitaryUnits = async () => {
  const militaryUnits = await fetch('http://localhost:5173/api/military-units');
  if (!militaryUnits.ok) throw new Error('Failed to fetch military units'); 
  const data = await militaryUnits.json();
  return data;
};

function RouteComponent() {
  const { t } = useTranslation();
  const columns = useMilitaryUnitColumns();
  const {
    data: militaryUnits,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['military-units'],
    queryFn: getMilitaryUnits as () => Promise<MilitaryUnitType[]>,
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
                {militaryUnits?.length
                  ? t('pages.authorizedRequestsFound', { count: militaryUnits.length })
                  : t('pages.noActiveRecords')}
              </p>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={militaryUnits || []} />
      </div>
    </AdminShell>
  );
}

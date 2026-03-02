import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useRequestColumns, type RequestModifiedType } from './columns';
import { DataTable } from './data-table';
import { UserShell } from '../../components/user_shell';
import { ClipboardList } from 'lucide-react';
import LoadingComponent from '@/components/helpers/loading_component';
import ErrorComponent from '@/components/helpers/error_component';

export const Route = createFileRoute(
  '/view-and-edit-requests/page'
)({
  component: RouteComponent,
});

const getRequestsOfUser = async () => {
  const userID = await fetch('http://localhost:5173/api/user-id');
  if (!userID.ok) throw new Error('Failed to fetch user id');
  const userIDText = await userID.text();
  // console.log('User ID: ', userIDText);

  const res = await fetch(
    `http://localhost:5173/api/requests-with-description/${userIDText}`
  );
  if (!res.ok) throw new Error('Failed to fetch requests');
  const data = await res.json();
  console.log('Requests of user response:', data);
  return data;
};

function RouteComponent() {
  const { t } = useTranslation();
  const columns = useRequestColumns();
  const {
    data: requestsOfUser,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['requestsOfUser'],
    queryFn: getRequestsOfUser as () => Promise<RequestModifiedType[]>,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });

  if (isLoading) {
      return <LoadingComponent shell='User' />
    }
  
    if (error) {
      return <ErrorComponent error={error} shell='User' />
    }

  return (
    <UserShell>
      <div className="space-y-6 max-w-7xl mx-auto w-full animate-slide-up">
        <div className="flex flex-col gap-2 pb-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 flex-shrink-0 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t('pages.activeRecords')}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {requestsOfUser?.length
                  ? t('pages.authorizedRequestsFound', { count: requestsOfUser.length })
                  : t('pages.noActiveRecords')}
              </p>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={requestsOfUser || []} />
      </div>
    </UserShell>
  );
}

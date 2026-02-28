import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { columns, type RequestModifiedType } from './columns';
import { DataTable } from './data-table';
import { AppShell } from '../../components/app_shell';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ClipboardList } from 'lucide-react';

export const Route = createFileRoute(
  '/view-and-edit-requests/page'
)({
  component: RouteComponent,
});

const getRequestsOfUser = async () => {
  const userID = await fetch('http://localhost:5173/api/user-id');
  if (!userID.ok) throw new Error('Failed to fetch user id');
  const userIDText = await userID.text();
  console.log('User ID: ', userIDText);

  const res = await fetch(
    `http://localhost:5173/api/requests-with-description/${userIDText}`
  );
  if (!res.ok) throw new Error('Failed to fetch requests');
  const data = await res.json();
  console.log('Requests of user response:', data);
  return data;
};

function RouteComponent() {
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
    <AppShell>
      <div className="space-y-8 max-w-7xl mx-auto w-full animate-slide-up">
        <div className="flex flex-col gap-2 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 flex-shrink-0 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Active Records</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {requestsOfUser?.length
                  ? `${requestsOfUser.length} authorized request${requestsOfUser.length !== 1 ? 's' : ''} found in your log`
                  : 'No active records found targeting your clearance'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl border-white/10 shadow-2xl overflow-hidden">
          <DataTable columns={columns} data={requestsOfUser || []} />
        </div>
      </div>
    </AppShell>
  );
}

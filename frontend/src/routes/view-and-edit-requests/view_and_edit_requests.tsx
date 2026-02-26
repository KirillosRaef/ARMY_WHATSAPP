import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query';
import { columns, type RequestModifiedType } from './columns';
import { DataTable } from './data-table';

export const Route = createFileRoute('/view-and-edit-requests/view_and_edit_requests')({
  component: RouteComponent,
})

const getRequestsOfUser = async () => {
  //TODO: GET THE USER ID PROPERLY FROM AUTH!!!!!!!!!!
  const res = await fetch(
    'http://localhost:5173/api/requests-with-description/V0MfGOTEO2vMT5bIojeVFiuUrtyigDXx',
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    },
  );

  if (!res.ok) {
    throw new Error('Failed to fetch requests of user');
  }

  const data = await res.json();
  console.log('Requests of user response:', data);
  return data;
};

function RouteComponent() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();

  const{
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
      <div className='flex justify-center items-center h-screen'>
        <div className='text-xl'>Loading requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-xl text-red-600'>Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-10'>
      <DataTable columns={columns} data={requestsOfUser || []} />
    </div>
  );
}

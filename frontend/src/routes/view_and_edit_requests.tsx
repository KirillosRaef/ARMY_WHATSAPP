import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/view_and_edit_requests')({
  component: RouteComponent,
})

// const getRequestsOfUser = async () => {
//   //TODO: GET THE USER ID PROPERLY FROM AUTH!!!!!!!!!!
//   const res = await fetch(
//     'http://localhost:5173/api/request/V0MfGOTEO2vMT5bIojeVFiuUrtyigDXx',
//     {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//     },
//   );

//   if (!res.ok) {
//     throw new Error('Failed to fetch device types');
//   }

//   const data = await res.json();
//   console.log('Requests of user response:', data);
//   return data;
// };

function RouteComponent() {
  return <div>Hello "/view_and_edit_requests"!</div>
}

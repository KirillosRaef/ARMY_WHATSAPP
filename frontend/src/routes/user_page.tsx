import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/user_page')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();
  
  const goToRequestDevice = () => {
    navigate({ to: '/request_to_add_device' });
  };

  const goToViewRequests = () => {
    navigate({ to: '/view_requests' });
  }


  return <div>
    <button className='btn btn-primary' onClick={goToRequestDevice} >Request to add a device</button>
    <button className='btn btn-secondary' onClick={goToViewRequests} >View Requests</button>
  </div>
}

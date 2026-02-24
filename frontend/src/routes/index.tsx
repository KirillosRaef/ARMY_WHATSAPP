import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    //TODO: Check if user is authenticated, if not, redirect to login page
    //TODO: if authenticated, check role and redirect to appropriate page
    return redirect({ to: '/login' });
  },
  component: Index,
});

function Index() {
  return (
    <div className='p-2'>
      <h3>Welcome Home!</h3>
    </div>
  );
}


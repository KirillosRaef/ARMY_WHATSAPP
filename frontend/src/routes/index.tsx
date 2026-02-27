import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const role = await fetch('http://localhost:5173/api/auth', { credentials: 'include' });
    if (!role.ok) {
      throw redirect({ to: '/login' });
    }

    const roleText = await role.text();
    if(roleText == 'admin') {
      throw redirect({ to: '/admin_page' });
    } else if(roleText == 'user') {
      throw redirect({ to: '/user_page' });
    }
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


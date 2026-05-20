import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const role = await fetch('/api/current-user-role', { credentials: 'include' });
    if (!role.ok) {
      throw redirect({ to: '/login' });
    }

    const roleText = await role.text();
    if(roleText == 'Admin') {
      throw redirect({ to: '/admin/admin_page' });
    } else if(roleText == 'User') {
      throw redirect({ to: '/user/user_page' });
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


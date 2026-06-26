import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import GlobalCallManager from '@/components/user_page_helpers/global_call_manager';

const RootLayout = () => (
  <>
    <Outlet />
    <GlobalCallManager />
    {/* <TanStackRouterDevtools /> */}
  </>
);

export const Route = createRootRoute({ beforeLoad: () => {}, component: RootLayout });

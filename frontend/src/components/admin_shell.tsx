import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import {
  MonitorSmartphone,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  LogOut,
  ChevronRight,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const navItems = [
  { to: '/admin/admin_page' as const, labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/admin/add_user' as const, labelKey: 'nav.addUser', icon: User },
  { to: '/admin/view_and_remove_users/page' as const, labelKey: 'nav.viewUsers', icon: User },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    navigate({ to: '/login', reloadDocument: true });
  };

  const activeNav = navItems.find(
    (n) => currentPath === n.to || currentPath.startsWith(n.to + '/')
  );
  const activeLabel = activeNav ? t(activeNav.labelKey) : t('nav.dashboard');

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 start-0 z-50 flex w-64 flex-col border-e border-white/5 bg-background"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl flex-shrink-0 glow-primary"
            style={{ background: 'linear-gradient(135deg, oklch(0.52 0.22 264), oklch(0.48 0.22 290))' }}
          >
            <MonitorSmartphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight text-foreground">AMRY</p>
            <p className="text-xs text-muted-foreground font-medium tracking-wide">{t('app.subtitle')}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
            {t('common.menu')}
          </p>
          {navItems.map(({ to, labelKey, icon: Icon }) => {
            const isActive = currentPath === to || currentPath.startsWith(to + '/');
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 relative',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                )}
              >
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-e-full" />
                )}
                
                <Icon
                  className={cn(
                    'h-4 w-4 flex-shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground'
                  )}
                />
                <span>{t(labelKey)}</span>
                {isActive && (
                  <ChevronRight className="me-auto h-3.5 w-3.5 text-primary/50 rtl:rotate-180" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-white/5 space-y-1 bg-white/[0.02]">
          <button
            className={cn(
              'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
              'text-muted-foreground hover:bg-white/5 hover:text-foreground'
            )}
          >
            <Settings className="h-4 w-4 flex-shrink-0 text-muted-foreground/70" />
            <span>{t('common.preferences')}</span>
          </button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive px-3 py-2.5 h-auto rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 flex-shrink-0 text-muted-foreground/70" />
            {t('common.disconnect')}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ms-64 min-h-dvh flex flex-col relative overflow-hidden">
        {/* Subtle mesh background element */}
        <div
          className="pointer-events-none fixed top-0 start-64 end-0 h-[500px] opacity-10"
          style={{
            background: 'radial-gradient(circle at top right, oklch(var(--primary)), transparent 70%)',
          }}
        />

        {/* Top bar */}
        <header
          className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 px-8"
          style={{
            background: 'oklch(var(--background) / 80%)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t('common.application')} / </span>
            <span className="text-foreground font-medium">{activeLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-8 relative z-10">{children}</div>
      </main>
    </div>
  );
}

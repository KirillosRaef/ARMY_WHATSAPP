import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import {
  MessageCircle,
  LogOut,
  ChevronRight,
  Settings,
  Search,
  Plus,
  User,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function UserShell({ children }: { children: ReactNode }) {
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

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Page content — full width */}
      <main className="flex-1 min-h-dvh flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}

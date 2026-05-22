import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import ConversationSidebar from '@/components/user_page_helpers/view_and_remove_conversations';
import LoadingComponent from '@/components/helpers/loading_component';
import ErrorComponent from '@/components/helpers/error_component';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Shield } from 'lucide-react';

export const Route = createFileRoute('/user/user_page')({
  component: UserDashboard,
});

const getCurrentUser = async () => {
  const user = await fetch('/api/current-user');
  if (!user.ok) throw new Error('Failed to fetch user');
  const data = await user.json();
  return data;
};

function UserDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: currentUser, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch { /* ignore */ }
    navigate({ to: '/login', reloadDocument: true });
  };

  if (isLoading) {
    return <LoadingComponent shell='User' />
  }

  if (error) {
    return <ErrorComponent error={error} shell='User' />
  }

  return (
    <div className="flex h-dvh bg-gray-100">
      {/* Left panel — Conversations sidebar */}
      <div className="w-[380px] flex-shrink-0 border-e border-gray-200 bg-white">
        <ConversationSidebar
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>

      {/* Right panel — Welcome / empty state */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden">
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 text-center max-w-md px-6 animate-fade-in">
          {/* Icon */}
          <div className="mx-auto mb-6 h-24 w-24 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center shadow-sm border border-indigo-100/50">
            <MessageCircle className="h-11 w-11 text-indigo-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t('chat.welcomeTitle')}
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {t('chat.welcomeDescription')}
          </p>

          {/* Encryption badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-gray-400 font-medium">{t('chat.encrypted')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

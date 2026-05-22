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
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden" style={{
        background: 'radial-gradient(circle at 60% 40%, rgba(99, 102, 241, 0.05) 0%, rgba(249, 250, 251, 1) 70%)',
      }}>
        {/* Modern animated subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366F1' fill-opacity='0.4'%3E%3Cpath d='M40 40v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-40V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 40v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Ambient background glows */}
        <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-indigo-200/20 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/4 left-1/3 h-[250px] w-[250px] rounded-full bg-purple-200/15 blur-[80px] pointer-events-none animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />

        <div className="relative z-10 text-center max-w-md px-6 animate-fade-in">
          {/* Modern Premium Floating Glassmorphic Icon */}
          <div className="mx-auto mb-8 h-28 w-28 rounded-[2.5rem] flex items-center justify-center relative group" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.4) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.12)',
            boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
          }}>
            <div className="absolute inset-2 rounded-[2rem] bg-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <MessageCircle className="h-12 w-12 text-indigo-500 relative transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
            {t('chat.welcomeTitle')}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            {t('chat.welcomeDescription')}
          </p>

          {/* Secure Live Encryption badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full border border-gray-150 shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:border-gray-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-gray-500 font-semibold tracking-wide uppercase">{t('chat.encrypted')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

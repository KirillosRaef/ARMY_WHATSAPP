import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import ConversationSidebar from '@/components/user_page_helpers/view_and_remove_conversations';
import ChatWindow from '@/components/user_page_helpers/chat_window';
import ErrorComponent from '@/components/helpers/error_component';
import LoadingComponent from '@/components/helpers/loading_component';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { CurrentUserConversationType } from '@/components/user_page_helpers/view_and_remove_conversations';

export const Route = createFileRoute('/user/$selectedConversationId')({
  component: RouteComponent,
});

const getCurrentUser = async () => {
  const user = await fetch('/api/current-user');
  if (!user.ok) throw new Error('Failed to fetch user');
  return user.json();
};

const getCurrentUserConversations = async () => {
  const currentUserId = await fetch('/api/current-user-id');
  const currentUserIdData = await currentUserId.text();

  const res = await fetch(`/api/current-user-conversations/${currentUserIdData}`);
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json() as Promise<CurrentUserConversationType[]>;
};

function RouteComponent() {
  const { selectedConversationId } = Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });

  const { data: conversations } = useQuery({
    queryKey: ['currentUserConversations'],
    queryFn: getCurrentUserConversations,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });

  // Mark the conversation as read when it's opened
  useEffect(() => {
    if (!currentUser?.id || !selectedConversationId) return;

    // Call the mark-read API
    fetch(`/api/conversations/${selectedConversationId}/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id }),
    }).catch((err) => console.error('Failed to mark conversation as read:', err));

    // Immediately zero out the unread count in the cache
    queryClient.setQueryData(
      ['currentUserConversations'],
      (oldData: CurrentUserConversationType[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((conv) =>
          conv.conversationId === selectedConversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        );
      }
    );
  }, [selectedConversationId, currentUser?.id, queryClient]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch { /* ignore */ }
    navigate({ to: '/login', reloadDocument: true });
  };

  if (userLoading) {
    return <LoadingComponent shell='User' />;
  }

  if (userError) {
    return <ErrorComponent error={userError} shell='User' />;
  }

  // Find the selected conversation's contact info
  const selectedConversation = conversations?.find(
    (c) => c.conversationId === selectedConversationId
  );

  return (
    <div className="flex h-dvh bg-gray-100">
      {/* Left panel — Conversations sidebar */}
      <div className="w-[380px] flex-shrink-0 border-e border-gray-200 bg-white hidden lg:block">
        <ConversationSidebar
          selectedConversationId={selectedConversationId}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>

      {/* Right panel — Chat window */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          conversationId={selectedConversationId}
          contactName={selectedConversation?.name || t('chat.unknown')}
          contactNumber={selectedConversation?.number || ''}
          currentUserId={currentUser?.id || ''}
          currentUserName={currentUser?.name || ''}
          contactUserId={selectedConversation?.userId || ''}
          onBack={() => navigate({ to: '/user/user_page' })}
        />
      </div>
    </div>
  );
}

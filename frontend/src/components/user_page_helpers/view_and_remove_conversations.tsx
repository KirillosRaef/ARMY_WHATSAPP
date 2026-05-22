import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Plus, LogOut, MessageCircle, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import AddConversation from './add_conversation';

export type CurrentUserConversationType = {
  conversationId: string;
  conversationMemberId: string;
  userId: string;
  name: string;
  email: string;
  number: string;
  isSelected: boolean;
};

const getCurrentUserConversations = async () => {
  const currentUserId = await fetch('/api/current-user-id');
  const currentUserIdData = await currentUserId.text();

  const currentUserConversations = await fetch(`/api/current-user-conversations/${currentUserIdData}`);
  if (!currentUserConversations.ok) throw new Error('Failed to fetch conversations');
  const currentUserConversationsData = await currentUserConversations.json() as CurrentUserConversationType[];
  return currentUserConversationsData.map((c) => ({ ...c, isSelected: false }));
};

// Color palette for avatar backgrounds
const avatarColors = [
  { bg: 'bg-blue-100/80 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300' },
  { bg: 'bg-emerald-100/80 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-violet-100/80 dark:bg-violet-950/60', text: 'text-violet-700 dark:text-violet-300' },
  { bg: 'bg-amber-100/80 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300' },
  { bg: 'bg-rose-100/80 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300' },
  { bg: 'bg-teal-100/80 dark:bg-teal-950/60', text: 'text-teal-700 dark:text-teal-300' },
  { bg: 'bg-indigo-100/80 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300' },
  { bg: 'bg-orange-100/80 dark:bg-orange-950/60', text: 'text-orange-700 dark:text-orange-300' },
];

function getAvatarColor(name: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

interface ConversationSidebarProps {
  selectedConversationId?: string;
  currentUser?: { name: string; email: string; number: string };
  onLogout: () => void;
}

export default function ConversationSidebar({
  selectedConversationId,
  currentUser,
  onLogout,
}: ConversationSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: conversations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['currentUserConversations'],
    queryFn: getCurrentUserConversations,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });

  const filteredConversations = conversations?.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.number.includes(searchQuery)
  );

  return (
    <div className="flex flex-col h-full bg-white border-e border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gray-50/80 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm">
                {currentUser?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name || t('chat.user')}</p>
            <p className="text-xs text-gray-500 truncate">{t('chat.online')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
            title={t('common.disconnect')}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search + New Conversation */}
      <div className="px-4 py-3 space-y-3">
        <div className="relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('chat.searchPlaceholder')}
            className="w-full ps-11 pe-4 py-2.5 bg-gray-100/80 rounded-full text-sm text-gray-700 placeholder:text-gray-400 border border-transparent outline-none focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
          />
        </div>
        <AddConversation />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3">
        <p className="px-3 pt-2 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400/80">
          {t('chat.conversations')} {filteredConversations ? `(${filteredConversations.length})` : ''}
        </p>

        {isLoading && (
          <div className="px-3 py-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-400">
              <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-indigo-500 animate-spin" />
              {t('common.loading')}
            </div>
          </div>
        )}

        {error && (
          <div className="mx-3 my-4 p-3 bg-red-50 rounded-xl text-sm text-red-600 border border-red-100">
            {error.message}
          </div>
        )}

        {!isLoading && !error && filteredConversations?.length === 0 && (
          <div className="px-3 py-12 text-center">
            <MessageCircle className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400">{t('chat.noConversations')}</p>
            <p className="text-xs text-gray-300 mt-1">{t('chat.startConversation')}</p>
          </div>
        )}

        <div className="space-y-1 pb-2">
          {filteredConversations?.map((conversation) => {
            const isActive = selectedConversationId === conversation.conversationId;
            const colorClass = getAvatarColor(conversation.name);

            return (
              <button
                key={conversation.conversationId}
                onClick={() => {
                  navigate({ to: `/user/${conversation.conversationId}` });
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group text-start relative',
                  isActive
                    ? 'bg-indigo-50/70 border border-indigo-100/40 shadow-sm shadow-indigo-150/10'
                    : 'hover:bg-gray-50/80 border border-transparent'
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-indigo-500 transition-all duration-300" />
                )}

                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <AvatarFallback className={cn(colorClass.bg, colorClass.text, 'font-semibold text-base')}>
                      {conversation.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <div className="absolute bottom-0 end-0 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={cn(
                      'text-sm font-semibold truncate transition-colors duration-300',
                      isActive ? 'text-indigo-900' : 'text-gray-900 group-hover:text-indigo-950'
                    )}>
                      {conversation.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {conversation.number}
                  </p>
                </div>

                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronRight className={cn(
                    'h-4 w-4 rtl:rotate-180 transition-colors',
                    isActive ? 'text-indigo-500' : 'text-gray-400'
                  )} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
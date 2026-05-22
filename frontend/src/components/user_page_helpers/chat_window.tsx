import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Smile, Paperclip, Phone, Video, MoreVertical, ArrowLeft, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

type MessageType = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string | null;
  content: string;
  type: string;
  createdAt: string;
};

const getMessages = async (conversationId: string) => {
  const res = await fetch(`/api/messages/${conversationId}`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json() as Promise<MessageType[]>;
};

// Avatar color palette
const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-orange-500',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

interface ChatWindowProps {
  conversationId: string;
  contactName: string;
  contactNumber: string;
  currentUserId: string;
  onBack?: () => void;
}

export default function ChatWindow({
  conversationId,
  contactName,
  contactNumber,
  currentUserId,
  onBack,
}: ChatWindowProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => getMessages(conversationId),
    refetchInterval: 3000,
    staleTime: 0,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const content = messageText.trim();
    if (!content || isSending) return;
    setIsSending(true);

    const optimisticMessage = {
      id: 'temp-' + Date.now(),
      conversationId,
      senderId: currentUserId,
      content: content,
      type: 'Text',
      createdAt: new Date().toISOString(),
    } as MessageType;
    setMessageText('');

    try {
      queryClient.setQueryData(
        ['messages', conversationId],
        (oldData: MessageType[]) => {
          if (!oldData) return [optimisticMessage];
          return [...oldData, optimisticMessage];
        }
      );
      const res = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: currentUserId,
          content: content,
          type: 'Text',
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to send');
      }
      const data = await res.json();
      queryClient.setQueryData(
        ['messages', conversationId],
        (old: MessageType[]) =>
          old.map(msg =>
            msg.id === optimisticMessage.id
              ? data
              : msg
          )
      );
    } catch (err) {
      queryClient.setQueryData(
        ['messages', conversationId],
        (old: MessageType[]) =>
          old.filter(msg => msg.id !== optimisticMessage.id)
      );
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return t('chat.today');
    if (date.toDateString() === yesterday.toDateString()) return t('chat.yesterday');
    return date.toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: MessageType[] }[] = [];
  messages?.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && new Date(lastGroup.messages[0].createdAt).toDateString() === dateKey) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] });
    }
  });

  const contactColor = getAvatarColor(contactName);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 -ms-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all lg:hidden"
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
        )}

        <Avatar className="h-10 w-10 shadow-sm">
          <AvatarFallback className={cn(contactColor, 'text-white font-semibold text-sm')}>
            {contactName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{contactName}</p>
          <p className="text-xs text-emerald-500 font-medium">{t('chat.online')}</p>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
            <Phone className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="h-5 w-5 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin" />
              {t('chat.loadingMessages')}
            </div>
          </div>
        )}

        {!isLoading && messages?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <Send className="h-7 w-7 text-indigo-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">{t('chat.noMessages')}</p>
            <p className="text-xs text-gray-300 mt-1">{t('chat.sendFirstMessage')}</p>
          </div>
        )}

        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date divider */}
            <div className="flex items-center justify-center my-4">
              <div className="px-4 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
                <span className="text-xs font-medium text-gray-500">
                  {formatDate(group.messages[0].createdAt)}
                </span>
              </div>
            </div>

            {/* Messages */}
            {group.messages.map((msg, idx) => {
              const isMine = msg.senderId === currentUserId;
              const showAvatar = !isMine && (idx === 0 || group.messages[idx - 1].senderId !== msg.senderId);

              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex mb-1',
                    isMine ? 'justify-end' : 'justify-start'
                  )}
                >
                  {!isMine && showAvatar && (
                    <Avatar className="h-7 w-7 mt-1 me-2 flex-shrink-0">
                      <AvatarFallback className={cn(contactColor, 'text-white text-[10px] font-semibold')}>
                        {contactName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {!isMine && !showAvatar && <div className="w-9 flex-shrink-0" />}

                  <div
                    className={cn(
                      'max-w-[75%] px-3.5 py-2 rounded-2xl shadow-sm relative group',
                      isMine
                        ? 'bg-indigo-500 text-white rounded-ee-md'
                        : 'bg-white text-gray-800 rounded-es-md border border-gray-100'
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <div className={cn(
                      'flex items-center gap-1 mt-1',
                      isMine ? 'justify-end' : 'justify-start'
                    )}>
                      <span className={cn(
                        'text-[10px]',
                        isMine ? 'text-indigo-200' : 'text-gray-400'
                      )}>
                        {formatTime(msg.createdAt)}
                      </span>
                      {isMine && (
                        <CheckCheck className="h-3 w-3 text-indigo-200" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2">
          <button className="p-2.5 rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex-shrink-0">
            <Smile className="h-5 w-5" />
          </button>
          <button className="p-2.5 rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all flex-shrink-0">
            <Paperclip className="h-5 w-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.typePlaceholder')}
              rows={1}
              className="w-full resize-none rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 border-0 outline-none focus:bg-gray-50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 max-h-28"
              style={{ minHeight: '42px' }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            className={cn(
              'p-2.5 rounded-xl transition-all duration-200 flex-shrink-0',
              messageText.trim()
                ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 hover:bg-indigo-600 active:scale-95'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

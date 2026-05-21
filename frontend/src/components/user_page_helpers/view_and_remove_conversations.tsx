import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useQuery } from "@tanstack/react-query";
import LoadingComponent from "../helpers/loading_component";
import ErrorComponent from "../helpers/error_component";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Checkbox } from "../ui/checkbox";
import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";


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
  if (!currentUserConversations.ok) throw new Error('Failed to fetch users'); 
  const currentUserConversationsData = await currentUserConversations.json() as CurrentUserConversationType[];
  const data = currentUserConversationsData.map((currentUserConversation) => {
    return {
      ...currentUserConversation,
      isSelected: false,
    };
  });

  console.log(data);
  return data;
};

// const deleteSelection = async (selectedConversations: string[]) => {
//   await fetch('/api/current-user-conversations', {
//     method: 'DELETE',
//     headers: { 'Content-Type': 'application/json' },
//     credentials: 'include',
//     body: JSON.stringify({ conversationIds: selectedConversations }),
//   });
// };

export default function ViewAndRemoveConversations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // const [isDeleting, setIsDeleting] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');

  const {
    data: currentUserConversations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['currentUserConversations'],
    queryFn: getCurrentUserConversations as () => Promise<CurrentUserConversationType[]>,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });

  // const [selectedConversations, setSelectedConversations] = useState<Record<string, boolean>>(() =>
  //     Object.fromEntries(currentUserConversations?.map((c) => [c.conversationId, c.isSelected]) || [])
  // );
  
  // const toggle = (key: string) => {
  //   setSelectedConversations((prev) => ({ ...prev, [key]: !prev[key] }));
  // };

  // const handleDelete = async () => {
  //   const selectedConversationIds = Object.keys(selectedConversations).filter((key) => selectedConversations[key]);
    
  //   setIsDeleting(true);
  //   try {
  //     await deleteSelection(selectedConversationIds);
  //     window.location.reload();
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  if (isLoading) {
    return <LoadingComponent shell='User' />
  }

  if (error) {
    return <ErrorComponent error={error} shell='User' />
  }

  return (
    <Command className="max-w-sm rounded-lg border">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        {/* <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="gap-2 animate-fade-in bg-destructive/15 text-red-500 hover:bg-destructive/30 hover:text-red-400 border border-destructive/20 h-9 rounded-lg px-4 transition-all"
        >
          {isDeleting ? (
            <>
              <div className="h-3.5 w-3.5 rounded-full border-2 border-red-500/40 border-t-red-500 animate-spin" />
              {t('table.deleting')}
            </>
          ) : (
            <>
              <Trash2 className="h-3.5 w-3.5" />
              {t('table.deleteSelected', { count: Object.keys(selectedConversations).filter((key) => selectedConversations[key]).length })}
            </>
          )}
        </Button> */}
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          {currentUserConversations?.map((currentUserConversation, i) => (
            <CommandItem key={currentUserConversation.conversationId}
              onSelect={() => {
                setSelectedConversationId(currentUserConversation.conversationId);
                navigate({
                  to: `/user/${currentUserConversation.conversationId}`,
                });
              }}
            >
              {/* <Checkbox
                checked={selectedConversations[currentUserConversation.conversationId]}
                onCheckedChange={() => toggle(currentUserConversation.conversationId)}
                aria-label={t('common.selectRow')}
                className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary translate-y-[2px]"
              /> */}
              <Avatar>
                <AvatarFallback>{currentUserConversation.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CommandShortcut>{currentUserConversation.name}</CommandShortcut>
              <CommandShortcut>{currentUserConversation.number}</CommandShortcut>
              <CommandShortcut>{currentUserConversation.email}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
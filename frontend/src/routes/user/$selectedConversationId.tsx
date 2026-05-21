import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import AddConversation from '@/components/user_page_helpers/add_conversation';
import ViewAndRemoveConversations from '@/components/user_page_helpers/view_and_remove_conversations';
import ErrorComponent from '@/components/helpers/error_component';
import LoadingComponent from '@/components/helpers/loading_component';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const Route = createFileRoute('/user/$selectedConversationId')({
  component: RouteComponent,
})

const getCurrentUser = async () => {
  const user = await fetch('/api/current-user');
  if (!user.ok) throw new Error('Failed to fetch user'); 
  const data = await user.json();
  console.log(data);
  return data;
};

function RouteComponent() {
  const { selectedConversationId } =
    Route.useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const { data: currentUser, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
  });

  if (isLoading) {
    return <LoadingComponent shell='User' />
  }

  if (error) {
    return <ErrorComponent error={error} shell='User' />
  }

  return <div>
    <Avatar>
      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
    </Avatar>
    <h1>{currentUser.name}</h1>
    <h1>{currentUser.email}</h1>
    <h1>{currentUser.number}</h1>
    <AddConversation />
    <ViewAndRemoveConversations />
  
    {/* TODO: Add Contacts table using scroll area and avatar */}
  </div>;
}

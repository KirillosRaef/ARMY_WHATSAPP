import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import AddConversation from '@/components/user_page_helpers/add_conversation';

export const Route = createFileRoute('/user/user_page')({
  component: UserDashboard,
});

function UserDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return <div>
    <AddConversation />

    {/* TODO: Add Contacts table using scroll area and avatar */}
  </div>;
}

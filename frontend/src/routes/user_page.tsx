import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { UserShell } from '../components/user_shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ClipboardList, ArrowRight, MonitorSmartphone, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/user_page')({
  component: UserDashboard,
});

function UserDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return 'empty';
}

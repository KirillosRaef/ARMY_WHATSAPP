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

  const userCards = [
    {
      labelKey: 'userDashboard.registerNewDevice',
      descKey: 'userDashboard.registerDescription',
      route: '/request_to_add_device' as const,
      icon: PlusCircle,
      color: 'oklch(0.52 0.22 264)',
    },
    {
      labelKey: 'pages.activeRecords',
      descKey: 'userDashboard.activeRecordsDescription',
      route: '/view-and-edit-requests/page' as const,
      icon: ClipboardList,
      color: 'oklch(0.55 0.18 290)',
    },
  ];

  return (
    <UserShell>
      <div className="space-y-8 animate-slide-up w-full">
        {/* Header - matching admin style */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 shadow-lg shadow-primary/20"
            style={{ background: 'linear-gradient(135deg, oklch(0.52 0.22 264), oklch(0.48 0.22 290))' }}
          >
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('dashboard.userTitle')}</h1>
              <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold text-xs">
                {t('dashboard.userBadge')}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">
              {t('dashboard.userOverview')}
            </p>
          </div>
        </div>

        {/* Action cards - matching admin grid style */}
        <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
          {userCards.map(({ labelKey, descKey, route, icon: Icon, color }) => (
            <Card
              key={labelKey}
              className="group relative flex flex-col overflow-hidden cursor-pointer glass-card hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              onClick={() => navigate({ to: route })}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="pb-1 relative z-10 pt-4 px-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 mb-2 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `${color}12` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <CardTitle className="text-base text-foreground font-medium">{t(labelKey)}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {t(descKey)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1 px-4 pb-4 relative z-10 mt-auto">
                <div className="inline-flex items-center gap-2 text-foreground font-medium text-sm group-hover:text-primary transition-colors">
                  {labelKey === 'userDashboard.registerNewDevice' ? t('userDashboard.startRegistration') : t('userDashboard.accessLogs')}{' '}
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tip strip - matches admin */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-2.5 max-w-2xl overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-l-xl" />
          <MonitorSmartphone className="h-4 w-4 text-primary shrink-0 ml-0.5" />
          <p className="text-xs text-foreground/85 leading-snug">
            <strong className="text-foreground font-medium">{t('userDashboard.tip')}</strong>{' '}
            {t('userDashboard.tipVerification')}
          </p>
        </div>
      </div>
    </UserShell>
  );
}

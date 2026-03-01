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

  return (
    <UserShell>
      <div className="space-y-10 animate-slide-up w-full">
        {/* Hero header */}
        {/* Header */}
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl flex-shrink-0 glow-primary"
            style={{ background: 'linear-gradient(135deg, oklch(0.52 0.22 264), oklch(0.48 0.22 290))' }}
          >
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('dashboard.userTitle')}</h1>
              <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold">
                {t('dashboard.userBadge')}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              {t('dashboard.userOverview')}
            </p>
          </div>
        </div>

        {/* Action cards */}
        <div className="grid gap-6 md:grid-cols-2 max-w-full">
          {/* Request device card */}
          <Card
            className="group relative flex flex-col overflow-hidden cursor-pointer border-white/10 glass-card hover:border-primary/50 transition-all duration-500"
            onClick={() => navigate({ to: '/request_to_add_device' })}
          >
            {/* Animated hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="pb-4 relative z-10 pt-8 px-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                <PlusCircle className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl text-foreground font-medium">{t('userDashboard.registerNewDevice')}</CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-2 max-w-md">
                {t('userDashboard.registerDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 px-8 pb-8 relative z-10 mt-auto">
              <div
                className="inline-flex items-center gap-2 text-foreground font-medium text-sm group-hover:text-primary transition-colors mt-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({ to: '/request_to_add_device' });
                }}
              >
                {t('userDashboard.startRegistration')} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>

          {/* View requests card */}
          <Card
            className="group relative flex flex-col overflow-hidden cursor-pointer border-white/10 glass-card hover:border-primary/50 transition-all duration-500"
            onClick={() =>
              navigate({ to: '/view-and-edit-requests/page' })
            }
          >
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="pb-4 relative z-10 pt-8 px-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                <ClipboardList className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl text-foreground font-medium">{t('pages.activeRecords')}</CardTitle>
              <CardDescription className="text-base text-muted-foreground mt-2">
                {t('userDashboard.activeRecordsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 px-8 pb-8 relative z-10">
              <div
                className="inline-flex items-center gap-2 text-foreground font-medium text-sm group-hover:text-primary transition-colors mt-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({ to: '/view-and-edit-requests/page' });
                }}
              >
                {t('userDashboard.accessLogs')} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick info strip */}
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-6 py-5 max-w-full overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
          <MonitorSmartphone className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-sm text-foreground/80 leading-relaxed">
            <strong className="text-foreground font-medium">{t('userDashboard.tip')}</strong>{' '}
            {t('userDashboard.tipVerification')}
          </p>
        </div>
      </div>
    </UserShell>
  );
}

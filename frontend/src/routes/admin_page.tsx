import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AdminShell } from '../components/admin_shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, ClipboardList, MonitorSmartphone, User } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/admin_page')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const stats = [
    { labelKey: 'nav.addBrand', route: '/admin/add-brand', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
    { labelKey: 'nav.viewBrands', route: '/admin/view_and_remove_brands/page', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
    { labelKey: 'nav.addMilitaryUnit', route: '/admin/add-military-unit', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
    { labelKey: 'nav.addBranch', route: '/admin/add-branch', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
    { labelKey: 'nav.viewMilitaryUnits', route: '/admin/view_and_remove_military_units/page', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
    { labelKey: 'nav.addUser', route: '/admin/add-user', icon: User, color: 'oklch(0.55 0.18 290)' },
    { labelKey: 'nav.viewUsers', route: '/admin/view_and_remove_users/page', icon: User, color: 'oklch(0.55 0.18 290)' },
    { labelKey: 'nav.addDeviceType', route: '/admin/add-device-type', icon: Users, color: 'oklch(0.55 0.18 290)' },
    { labelKey: 'nav.viewDeviceTypes', route: '/admin/view_and_remove_device_types/page', icon: Users, color: 'oklch(0.55 0.18 290)' },
    { labelKey: 'nav.viewRequests', route: '/admin/view-accept-reject-requests/page', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
    { labelKey: 'nav.addDevice', route: '/admin/add-device', icon: MonitorSmartphone, color: 'oklch(0.5 0.18 220)' },
    { labelKey: 'nav.viewDevices', route: '/admin/view_and_edit_devices/page', icon: MonitorSmartphone, color: 'oklch(0.5 0.18 220)' },
  ];

  //TODO: 1) ADMIN CAN ADD/REMOVE BRANDLOGO (DONE)
  //TODO: 2) ADMIN CAN CREATE/DELETE/EDIT USERS (DONE)
  //TODO: 3) ADMIN CAN CREATE/DELETE/EDIT DEVICETYPES (DONE)
  //TODO: 4) ADMIN CAN VIEW then ACCEPT/REJECT REQUESTS TO ADD DEVICES (DONE)

  //TODO: 5) ADMIN CAN VIEW CREATE/DELETE/EDIT DEVICES (DONE)
  //TODO: 6) ADMIN CAN SEARCH AND FILTER DEVICES (DONE)
  //TODO: 7) MAKE SURE THE ADMIN MENU IS NOT THE USER MENU (DONE)

  //WITH SAMEH
  //TODO: 8) ASK AI TO REDO WITH PLANNING THE UI
  //TODO: 9) Translate into arabic/english
  //TODO: 10) LIGHT/DARK MODE

  //TODO: 11) Clickable images (DONE)
  //TODO: 12) fix your filters/searches if possible
  //TODO: 13) Add unit and far3 and user name
  //TODO: 14) Table can make image columns invisible and others like unit and far3
  //TODO: 15) Next and previous buttons (DONE)
  //TODO: 16) Make sure the total count is present in the table, even when searching (DONE)
  //TODO: 17) HANDLES CASCADING DELETES PROPERLY
  return (
    <AdminShell>
      <div className="space-y-8 animate-slide-up">
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
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('dashboard.adminTitle')}</h1>
              <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold">
                {t('dashboard.adminBadge')}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              {t('dashboard.adminOverview')}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 max-w-3xl">
          {stats.map(({ labelKey, route, icon: Icon, color }) => (
            <Card key={labelKey} className="glass-card border-white/8"
            onClick={() => {navigate({to: route})}}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t(labelKey)}</CardTitle>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${color}20` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Placeholder content */}
        <Card className="glass-card border-white/8 max-w-3xl">
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.pendingReviews')}</CardTitle>
            <CardDescription>{t('dashboard.pendingReviewsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <ClipboardList className="h-10 w-10 opacity-30" />
              <p className="text-sm">{t('dashboard.adminFeaturesComingSoon')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

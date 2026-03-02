import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AdminShell } from '../components/admin_shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, ClipboardList, MonitorSmartphone, User, ArrowRight, Lightbulb } from 'lucide-react';

export const Route = createFileRoute('/admin_page')({
  component: AdminDashboard,
});

const adminCards = [
  { labelKey: 'nav.addBrand', descKey: 'adminDashboard.addBrandDesc', route: '/admin/add-brand', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
  { labelKey: 'nav.viewBrands', descKey: 'adminDashboard.viewBrandsDesc', route: '/admin/view_and_remove_brands/page', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
  { labelKey: 'nav.addMilitaryUnit', descKey: 'adminDashboard.addMilitaryUnitDesc', route: '/admin/add-military-unit', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
  { labelKey: 'nav.addBranch', descKey: 'adminDashboard.addBranchDesc', route: '/admin/add-branch', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
  { labelKey: 'nav.viewMilitaryUnits', descKey: 'adminDashboard.viewMilitaryUnitsDesc', route: '/admin/view_and_remove_military_units/page', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
  { labelKey: 'nav.addUser', descKey: 'adminDashboard.addUserDesc', route: '/admin/add-user', icon: User, color: 'oklch(0.55 0.18 290)' },
  { labelKey: 'nav.viewUsers', descKey: 'adminDashboard.viewUsersDesc', route: '/admin/view_and_remove_users/page', icon: User, color: 'oklch(0.55 0.18 290)' },
  { labelKey: 'nav.addDeviceType', descKey: 'adminDashboard.addDeviceTypeDesc', route: '/admin/add-device-type', icon: Users, color: 'oklch(0.55 0.18 290)' },
  { labelKey: 'nav.viewDeviceTypes', descKey: 'adminDashboard.viewDeviceTypesDesc', route: '/admin/view_and_remove_device_types/page', icon: Users, color: 'oklch(0.55 0.18 290)' },
  { labelKey: 'nav.viewRequests', descKey: 'adminDashboard.viewRequestsDesc', route: '/admin/view-accept-reject-requests/page', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
  { labelKey: 'nav.addDevice', descKey: 'adminDashboard.addDeviceDesc', route: '/admin/add-device', icon: MonitorSmartphone, color: 'oklch(0.5 0.18 220)' },
  { labelKey: 'nav.viewDevices', descKey: 'adminDashboard.viewDevicesDesc', route: '/admin/view_and_edit_devices/page', icon: MonitorSmartphone, color: 'oklch(0.5 0.18 220)' },
];

function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      <div className="space-y-5 animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 glow-primary"
            style={{ background: 'linear-gradient(135deg, oklch(0.52 0.22 264), oklch(0.48 0.22 290))' }}
          >
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('dashboard.adminTitle')}</h1>
              <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold text-xs">
                {t('dashboard.adminBadge')}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">
              {t('dashboard.adminOverview')}
            </p>
          </div>
        </div>

        {/* Action cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 w-full max-w-6xl">
          {adminCards.map(({ labelKey, descKey, route, icon: Icon, color }) => (
            <Card
              key={labelKey}
              className="group relative flex flex-col overflow-hidden cursor-pointer border-white/10 glass-card hover:border-primary/50 transition-all duration-500"
              onClick={() => navigate({ to: route })}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardHeader className="pb-1 relative z-10 pt-4 px-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 mb-2 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]"
                  style={{ background: `${color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <CardTitle className="text-base text-foreground font-medium">{t(labelKey)}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {t(descKey)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1 px-4 pb-4 relative z-10 mt-auto">
                <div
                  className="inline-flex items-center gap-2 text-foreground font-medium text-sm group-hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate({ to: route });
                  }}
                >
                  {t('adminDashboard.open')} <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tip strip - same style as user dashboard */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-2.5 max-w-6xl overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-l-xl" />
          <Lightbulb className="h-4 w-4 text-primary shrink-0 ml-0.5" />
          <p className="text-xs text-foreground/85 leading-snug">
            <strong className="text-foreground font-medium">{t('adminDashboard.tip')}</strong>{' '}
            {t('adminDashboard.tipText')}
          </p>
        </div>

        {/* Placeholder content */}
        <Card className="glass-card border-white/8 max-w-6xl">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm">{t('dashboard.pendingReviews')}</CardTitle>
            <CardDescription className="text-xs">{t('dashboard.pendingReviewsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
              <ClipboardList className="h-8 w-8 opacity-30" />
              <p className="text-sm">{t('dashboard.adminFeaturesComingSoon')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

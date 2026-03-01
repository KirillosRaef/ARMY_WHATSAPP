import { createFileRoute } from '@tanstack/react-router';
import { AdminShell } from '../components/admin_shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, ClipboardList, MonitorSmartphone, User } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/admin_page')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const stats = [
    { label: 'Add a Brand', route: '/admin/add-brand', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
    { label: 'View Brands', route: '/admin/view_and_remove_brands/page', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
    { label: 'Add a User', route: '/admin/add-user', icon: User, color: 'oklch(0.55 0.18 290)' },
    { label: 'View Users', route: '/admin/view_and_remove_users/page', icon: User, color: 'oklch(0.55 0.18 290)' },
    { label: 'Add a Device Type', route: '/admin/add-device-type', icon: Users, color: 'oklch(0.55 0.18 290)' },
    { label: 'View Device Types', route: '/admin/view_and_remove_device_types/page', icon: Users, color: 'oklch(0.55 0.18 290)' },
    { label: 'View Requests', route: '/admin/view-accept-reject-requests/page', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
    { label: 'Add a Device', route: '/admin/add-device', icon: MonitorSmartphone, color: 'oklch(0.5 0.18 220)' },
    { label: 'View Devices', route: '/admin/view_and_edit_devices/page', icon: MonitorSmartphone, color: 'oklch(0.5 0.18 220)' },
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
  //TODO: 15) Next and previous buttons
  //TODO: 16) Make sure the total count is present in the table, even when searching
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
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
              <Badge className="bg-primary/20 text-primary border-primary/30 font-semibold">
                Admin
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              Overview of all devices, requests, and user accounts
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 max-w-3xl">
          {stats.map(({ label,route, icon: Icon, color }) => (
            <Card key={label} className="glass-card border-white/8"
            onClick={() => {navigate({to: route})}}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
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
            <CardTitle className="text-base">Pending Reviews</CardTitle>
            <CardDescription>Device requests awaiting admin approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <ClipboardList className="h-10 w-10 opacity-30" />
              <p className="text-sm">Admin management features coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

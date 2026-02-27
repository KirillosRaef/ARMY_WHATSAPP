import { createFileRoute } from '@tanstack/react-router';
import { AppShell } from '../components/app_shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, ClipboardList, MonitorSmartphone } from 'lucide-react';

export const Route = createFileRoute('/admin_page')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = [
    { label: 'Total Requests', value: '—', icon: ClipboardList, color: 'oklch(0.52 0.22 264)' },
    { label: 'Active Users', value: '—', icon: Users, color: 'oklch(0.55 0.18 290)' },
    { label: 'Registered Devices', value: '—', icon: MonitorSmartphone, color: 'oklch(0.5 0.18 220)' },
  ];

  //TODO: 1) ADMIN CAN CREATE/DELETE/EDIT USERS
  //TODO: 2) ADMIN CAN CREATE/DELETE/EDIT DEVICETYPES
  //TODO: 3) ADMIN CAN VIEW then ACCEPT/REJECT REQUESTS TO ADD DEVICES
  //TODO: 4) ADMIN CAN VIEW CREATE/DELETE/EDIT DEVICES
  //TODO: 5) ADMIN CAN SEARCH AND FILTER DEVICES
  //TODO: 6) MAKE SURE THE ADMIN MENU IS NOT THE USER MENU
  return (
    <AppShell>
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
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="glass-card border-white/8">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${color}20` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
              </CardContent>
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
    </AppShell>
  );
}

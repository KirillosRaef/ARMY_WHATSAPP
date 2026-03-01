import { UserShell } from "../user_shell";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { AdminShell } from "../admin_shell";


export default function LoadingComponent({ shell }: { shell: 'User' | 'Admin' }) {
  return (
    shell === 'User' ? 
      (
      <UserShell>
        <div className="space-y-6 max-w-5xl mx-auto w-full animate-fade-in">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card className="glass-card shadow-sm border-border rounded-lg">
            <CardContent className="space-y-4 pt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </UserShell>
    ) : (
      <AdminShell>
        <div className="space-y-6 max-w-5xl mx-auto w-full animate-fade-in">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card className="glass-card shadow-sm border-border rounded-lg">
            <CardContent className="space-y-4 pt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </AdminShell>
      )
  )
}
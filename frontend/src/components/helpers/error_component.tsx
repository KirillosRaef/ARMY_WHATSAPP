import { AlertCircle } from "lucide-react";
import { UserShell } from "../user_shell";
import { AdminShell } from "../admin_shell";


export default function ErrorComponent( {error, shell}: {error: Error, shell: 'User' | 'Admin'}) {
  return (
    shell === 'User' ? (
      <UserShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-semibold text-foreground">Failed to load device types</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </UserShell>
    ) : (
      <AdminShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-semibold text-foreground">Failed to load device types</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </AdminShell>
    )
  )
}
import { AlertCircle } from "lucide-react";
import { AppShell } from "../app_shell";


export default function ErrorComponent({error}: {error: Error}) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-semibold text-foreground">Failed to load device types</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </AppShell>
    );
}
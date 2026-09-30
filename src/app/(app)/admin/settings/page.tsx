import { requireRole } from "@/lib/rbac"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default async function AdminSettingsPage() {
  await requireRole(['ADMIN'])

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure global platform settings, integration options, and security policies.
        </p>
      </div>

      <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-4 bg-primary/5 rounded-full mb-4">
            <Settings className="h-12 w-12 text-primary/40" />
          </div>
          <h3 className="text-xl font-medium text-primary">Settings Module Coming Soon</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            This administrative module is currently under development. It will allow you to configure identity providers, notification templates, and platform branding.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

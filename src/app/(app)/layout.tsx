import { AppSidebar } from "@/components/layout/AppSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full h-full min-h-screen bg-background">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
            <SidebarTrigger />
            <div className="font-semibold">Capacity Connect</div>
          </header>
          <div className="p-6">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  )
}

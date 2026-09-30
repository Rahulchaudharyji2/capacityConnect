import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { BookOpen, Calendar, GraduationCap, LayoutDashboard, Search, FileEdit, Settings, Shield } from "lucide-react"

export async function AppSidebar() {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const roles = user.roles.map(r => r.role.name);
  const isLearner = roles.includes('LEARNER');
  const isTrainer = roles.includes('TRAINER');
  const isAdmin = roles.includes('ADMIN');

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center p-2 font-bold text-primary">
          <GraduationCap className="mr-2 h-6 w-6" />
          <span>Capacity Connect</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isLearner && (
          <SidebarGroup>
            <SidebarGroupLabel>Learner</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/dashboard"><LayoutDashboard /><span>Overview</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/learning-plans"><BookOpen /><span>Learning Plans</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/catalogue"><Search /><span>Course Catalogue</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/knowledge"><BookOpen /><span>Knowledge Library</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/calendar"><Calendar /><span>Training Calendar</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isTrainer && (
          <SidebarGroup>
            <SidebarGroupLabel>Trainer</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/trainer/dashboard"><LayoutDashboard /><span>Trainer Overview</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/trainer/courses"><FileEdit /><span>My Courses</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/users"><Shield /><span>Users & Roles</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/learning-plans"><BookOpen /><span>Learning Plans</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/competencies"><Shield /><span>Competencies</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/audit-logs"><Search /><span>Audit Logs</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/settings"><Settings /><span>System Settings</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <form action={async () => { "use server"; const { logout } = await import("@/app/actions/auth"); await logout(); }}>
                  <SidebarMenuButton type="submit">
                    <span className="text-destructive font-medium">Log out</span>
                  </SidebarMenuButton>
                </form>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

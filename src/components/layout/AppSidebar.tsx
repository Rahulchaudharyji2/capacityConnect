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
                    <a href="/dashboard"><LayoutDashboard /><span>Overview</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/learning-plans"><BookOpen /><span>Learning Plans</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/catalogue"><Search /><span>Course Catalogue</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/knowledge"><BookOpen /><span>Knowledge Library</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/calendar"><Calendar /><span>Training Calendar</span></a>
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
                    <a href="/trainer/dashboard"><LayoutDashboard /><span>Trainer Overview</span></a>
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
                    <a href="/admin/users"><Shield /><span>Users & Roles</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/admin/learning-plans"><BookOpen /><span>Learning Plans</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/competencies"><Shield /><span>Competencies</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/audit-logs"><Search /><span>Audit Logs</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/settings"><Settings /><span>System Settings</span></a>
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

import { requireRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { addCourseToPlan, assignPlanToLearner } from "../actions"

export default async function LearningPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireRole(['ADMIN'])

  const plan = await prisma.learningPlan.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { order: 'asc' },
        include: { course: true }
      },
      assignments: {
        include: { user: true },
        orderBy: { assignedAt: 'desc' }
      }
    }
  })

  if (!plan) return <div>Plan not found</div>

  const publishedCourses = await prisma.course.findMany({
    where: { isPublished: true }
  })

  // In a real app we'd paginate or search users, but we'll fetch all non-admins for prototype
  const allUsers = await prisma.user.findMany({
    include: { roles: { include: { role: true } } }
  })
  
  const eligibleLearners = allUsers.filter(u => u.roles.some(r => r.role.name === 'LEARNER'))

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" asChild className="pl-0 text-muted-foreground">
          <Link href="/admin/learning-plans">← Back to Plans</Link>
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary">{plan.title}</h1>
          <p className="text-muted-foreground mt-2">{plan.description || "No description provided."}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <CardTitle>Required Courses</CardTitle>
              <CardDescription>Courses required to complete this plan.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {plan.items.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border/50 mb-6">No courses added yet.</div>
              ) : (
                <div className="flex flex-col gap-3 mb-6">
                  {plan.items.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-4 border border-border/50 rounded-lg p-3 bg-secondary/10 hover:bg-secondary/20 transition-colors group">
                      <div className="text-sm font-medium bg-background border border-border/50 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground shadow-sm">{i + 1}</div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-primary text-sm group-hover:text-primary/80 transition-colors">{item.course.title}</h4>
                      </div>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-3 opacity-0 group-hover:opacity-100 transition-opacity">Remove</Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-6 border-t border-border/50">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" /> Add Course
                </h4>
                <form action={addCourseToPlan.bind(null, plan.id)} className="flex gap-3">
                  <select name="courseId" required className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select a published course...</option>
                    {publishedCourses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <Button type="submit" className="shadow-md shadow-primary/20 hover:scale-105 transition-all px-6">Add</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <CardTitle>Learner Assignments</CardTitle>
              <CardDescription>Users assigned to this learning plan.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {plan.assignments.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border/50 mb-6">No learners assigned yet.</div>
              ) : (
                <div className="flex flex-col gap-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {plan.assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                           <div className="text-sm font-semibold text-foreground">{assignment.user.firstName} {assignment.user.lastName}</div>
                           <div className="text-xs text-muted-foreground mt-0.5">{assignment.user.email}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-6 border-t border-border/50">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Assign Learner
                </h4>
                <form action={assignPlanToLearner.bind(null, plan.id)} className="flex gap-3">
                   <select name="userId" required className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select a learner...</option>
                    {eligibleLearners.map(u => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                    ))}
                  </select>
                  <Button type="submit" className="shadow-md shadow-primary/20 hover:scale-105 transition-all px-6">Assign</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

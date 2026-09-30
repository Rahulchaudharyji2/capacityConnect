import { requireRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Users, BookOpen } from "lucide-react"
import Link from "next/link"
import { createLearningPlan } from "./actions"

export default async function AdminLearningPlansPage() {
  await requireRole(['ADMIN'])

  const plans = await prisma.learningPlan.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          items: true,
          assignments: true
        }
      }
    }
  })

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary">Learning Plans</h1>
          <p className="text-muted-foreground mt-2">Manage competency-based learning paths and assign them to learners.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[350px_1fr] gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createLearningPlan} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Plan Title</label>
                  <Input id="title" name="title" required placeholder="e.g. Onboarding Track" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="targetAudience" className="text-sm font-medium">Target Audience</label>
                  <Input id="targetAudience" name="targetAudience" placeholder="e.g. New Hires" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                <Button type="submit" className="w-full mt-2">
                  <Plus className="mr-2 h-4 w-4" /> Create
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Active Plans</CardTitle>
              <CardDescription>All structured learning plans across the organization.</CardDescription>
            </CardHeader>
            <CardContent>
              {plans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No learning plans found.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {plans.map(plan => (
                    <div key={plan.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <h3 className="font-semibold text-primary text-lg">{plan.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" /> {plan._count.items} Required Courses
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" /> {plan._count.assignments} Learners Assigned
                          </span>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/admin/learning-plans/${plan.id}`}>Manage Plan</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

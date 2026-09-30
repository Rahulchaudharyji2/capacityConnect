import { requireRole, requireUser } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, FileEdit, Plus, Users } from "lucide-react"
import Link from "next/link"

export default async function TrainerDashboard() {
  const user = await requireRole(['TRAINER'])

  const courses = await prisma.course.findMany({
    where: { ownerId: user.id },
    include: {
      _count: {
        select: { enrollments: true }
      }
    }
  })

  const published = courses.filter(c => c.isPublished)
  const drafts = courses.filter(c => !c.isPublished)
  const totalEnrollments = courses.reduce((acc, course) => acc + course._count.enrollments, 0)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Trainer Overview</h1>
          <p className="text-muted-foreground mt-2">
            Manage your courses and view learner engagement.
          </p>
        </div>
        <Button asChild>
          <Link href="/trainer/courses/create">
            <Plus className="mr-2 h-4 w-4" /> Create Course
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{published.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Courses</CardTitle>
            <FileEdit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drafts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't created any courses yet.</p>
              <Button variant="outline" asChild>
                <Link href="/trainer/courses/create">Create your first course</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {courses.slice(0, 5).map(course => (
                <div key={course.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <h4 className="font-semibold text-primary">{course.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.isPublished ? 'Published' : 'Draft'} • {course._count.enrollments} Learners
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/trainer/courses/${course.id}`}>Manage</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

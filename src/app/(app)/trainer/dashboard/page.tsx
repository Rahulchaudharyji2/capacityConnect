import { requireRole, requireUser } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, FileEdit, Plus, Users } from "lucide-react"
import Link from "next/link"
import { EnrollmentChart } from "@/components/trainer/EnrollmentChart"

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

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published Courses</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <BookOpen className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{published.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft Courses</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <FileEdit className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{drafts.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrollments</CardTitle>
            <div className="p-2 bg-accent/10 rounded-lg">
              <Users className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEnrollments}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
              <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="mb-4">You haven't created any courses yet.</p>
              <Button className="rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-all" asChild>
                <Link href="/trainer/courses/create">Create your first course</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {courses.slice(0, 5).map(course => (
                <div key={course.id} className="group flex items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{course.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className={course.isPublished ? "text-green-600 dark:text-green-400 font-medium" : "text-orange-500 font-medium"}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span> 
                      <span className="mx-2 text-border">•</span>
                      {course._count.enrollments} Learners
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" className="rounded-full shadow-sm hover:scale-105 transition-transform" asChild>
                    <Link href={`/trainer/courses/${course.id}`}>Manage</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <CardHeader>
          <CardTitle>Course Enrollments Overview</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 pt-4">
          <EnrollmentChart data={courses.map(c => ({ name: c.title, total: c._count.enrollments }))} />
        </CardContent>
      </Card>
    </div>
  )
}

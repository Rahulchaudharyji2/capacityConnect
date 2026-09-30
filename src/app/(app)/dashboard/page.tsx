import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, CheckCircle, Clock, GraduationCap } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function LearnerDashboard() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/')
  }

  // Fetch actual data
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { 
      course: {
        include: {
          sections: {
            include: { lessons: true }
          }
        }
      } 
    }
  })

  // We need the completions to calculate real progress per course
  const completions = await prisma.lessonCompletion.findMany({
    where: { userId: user.id }
  })
  const completionSet = new Set(completions.map(c => c.lessonId))

  const coursesWithProgress = enrollments.map(enrollment => {
    const totalLessons = enrollment.course.sections.flatMap(s => s.lessons).length
    const courseLessonIds = enrollment.course.sections.flatMap(s => s.lessons.map(l => l.id))
    const completedCount = courseLessonIds.filter(id => completionSet.has(id)).length
    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
    return { ...enrollment, progress, totalLessons, completedCount }
  })

  const inProgress = coursesWithProgress.filter(e => e.status === 'IN_PROGRESS' || (e.progress > 0 && e.progress < 100))
  const completed = coursesWithProgress.filter(e => e.status === 'COMPLETED' || e.progress === 100)
  const totalAssigned = enrollments.length
  
  // Calculate a basic progress metric across all assigned courses
  const averageProgress = totalAssigned > 0 
    ? Math.round(coursesWithProgress.reduce((acc, curr) => acc + curr.progress, 0) / totalAssigned)
    : 0

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Good morning, {user.firstName}</h1>
        <p className="text-muted-foreground mt-2">
          Here is a summary of your learning activity in {user.organizationalUnit?.name || 'your unit'}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssigned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgress.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
          </CardHeader>
          <CardContent>
            {inProgress.length > 0 ? (
              <div className="flex flex-col gap-4">
                {inProgress.map(enrollment => (
                  <div key={enrollment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-semibold text-primary">{enrollment.course.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {enrollment.progress}% Complete ({enrollment.completedCount}/{enrollment.totalLessons})
                      </p>
                    </div>
                    <Button variant="secondary" size="sm" asChild>
                      <a href={`/courses/${enrollment.course.id}`}>Resume</a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No courses in progress. Browse the catalogue to start learning.</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Completed Learning</CardTitle>
          </CardHeader>
          <CardContent>
             {completed.length > 0 ? (
              <div className="flex flex-col gap-4">
                {completed.map(enrollment => (
                  <div key={enrollment.id} className="flex items-center gap-4">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <p className="text-sm"><span className="font-semibold">{enrollment.course.title}</span></p>
                  </div>
                ))}
              </div>
             ) : (
               <p className="text-sm text-muted-foreground">You haven't completed any courses yet.</p>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, CheckCircle, Clock, GraduationCap, ArrowRight, TrendingUp } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ProgressChart } from "@/components/learner/ProgressChart"

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

  const currentHour = new Date().getHours()
  let greeting = "Good evening"
  if (currentHour < 12) greeting = "Good morning"
  else if (currentHour < 18) greeting = "Good afternoon"

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">{greeting}, {user.firstName}</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Here is a summary of your learning activity in <span className="font-medium text-foreground">{user.organizationalUnit?.name || 'your unit'}</span>.
          </p>
        </div>
        <Button className="rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-all" asChild>
          <Link href="/catalogue">
            <BookOpen className="mr-2 h-4 w-4" /> Browse Catalogue
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Assigned Courses</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAssigned}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Courses</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completed.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inProgress.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Progress</CardTitle>
            <div className="p-2 bg-accent/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageProgress}%</div>
            <div className="mt-4 h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-1000 ease-out rounded-full" style={{ width: `${averageProgress}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inProgress.length > 0 ? (
              <div className="flex flex-col gap-4">
                {inProgress.map(enrollment => (
                  <div key={enrollment.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                    <div className="mb-4 sm:mb-0">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{enrollment.course.title}</h4>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="text-sm text-muted-foreground font-medium">
                          {enrollment.progress}% Complete
                        </div>
                        <div className="flex-1 min-w-[100px] h-1.5 bg-background rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${enrollment.progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" className="rounded-full shadow-sm hover:scale-105 transition-transform" asChild>
                      <a href={`/courses/${enrollment.course.id}`}>
                        Resume <ArrowRight className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
                <GraduationCap className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p>No courses in progress.</p>
                <Button variant="link" className="mt-2 text-primary">Browse Catalogue</Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completed Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
             {completed.length > 0 ? (
              <div className="flex flex-col gap-3">
                {completed.map(enrollment => (
                  <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-green-500/10 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="font-medium text-foreground">{enrollment.course.title}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-full">Review</Button>
                  </div>
                ))}
              </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
                 <CheckCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
                 <p>You haven't completed any courses yet.</p>
               </div>
             )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <CardHeader>
          <CardTitle>Course Progress Visualized</CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 pt-4">
          <ProgressChart data={coursesWithProgress.map(c => ({ name: c.course.title, progress: c.progress }))} />
        </CardContent>
      </Card>
    </div>
  )
}

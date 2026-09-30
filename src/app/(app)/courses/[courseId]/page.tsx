import { requireUser } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const user = await requireUser()
  
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              completions: {
                where: { userId: user.id }
              }
            }
          }
        }
      },
      enrollments: {
        where: { userId: user.id }
      }
    }
  })

  if (!course) return <div>Course not found</div>

  const isEnrolled = course.enrollments.length > 0;
  
  // Learners can only view published courses. (Trainers can view drafts they own, but we'll simplify this check for this component).
  const userRoles = user.roles.map(r => r.role.name);
  if (!course.isPublished && !userRoles.includes('TRAINER') && !userRoles.includes('ADMIN')) {
    redirect('/catalogue')
  }

  const allLessons = course.sections.flatMap(s => s.lessons)
  const completedLessonsCount = allLessons.filter(l => l.completions.length > 0).length
  const totalLessons = allLessons.length
  
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary">{course.title}</h1>
          <p className="text-muted-foreground mt-2">{course.summary || course.description}</p>
        </div>
      </div>

      {isEnrolled && (
        <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="w-full md:w-auto">
              <h3 className="font-semibold text-primary">Your Progress</h3>
              <p className="text-sm text-muted-foreground">{completedLessonsCount} of {totalLessons} lessons completed</p>
            </div>
            <div className="flex-1 w-full flex items-center gap-4">
              <div className="flex-1 h-3 bg-secondary/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }} />
              </div>
              <div className="text-2xl font-bold text-primary w-16 text-right">{progressPercentage}%</div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold border-b border-border/50 pb-2">Course Syllabus</h2>
        {course.sections.length === 0 ? (
           <div className="text-center py-12 text-muted-foreground bg-background/20 rounded-xl border border-dashed border-white/10">This course has no content yet.</div>
        ) : (
          course.sections.map((section) => (
            <Card key={section.id} className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-white/5 py-4">
                <CardTitle className="text-lg font-semibold">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {section.lessons.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-6">No lessons in this section.</p>
                ) : (
                  <div className="divide-y divide-border/30">
                    {section.lessons.map(lesson => {
                      const isCompleted = lesson.completions.length > 0;
                      return (
                        <div key={lesson.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-secondary/10 transition-colors gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`mt-0.5 p-1.5 rounded-full ${isCompleted ? 'bg-success/10' : 'bg-muted'}`}>
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-success" />
                              ) : (
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{lesson.title}</h4>
                            </div>
                          </div>
                          {isEnrolled ? (
                             <Button variant={isCompleted ? "outline" : "default"} size="sm" className={!isCompleted ? "shadow-md shadow-primary/20 hover:scale-105 transition-transform" : "hover:scale-105 transition-transform"} asChild>
                               <Link href={`/courses/${course.id}/lessons/${lesson.id}`}>{isCompleted ? 'Review' : 'Start'}</Link>
                             </Button>
                          ) : (
                            <Button variant="ghost" size="sm" disabled>Requires Enrollment</Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

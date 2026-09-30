import { requireUser } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, BookOpen, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

export default async function LearningPlansPage() {
  const user = await requireUser()

  const assignments = await prisma.learningPlanAssignment.findMany({
    where: { userId: user.id },
    include: {
      plan: {
        include: {
          items: {
            orderBy: { order: 'asc' },
            include: {
              course: {
                include: {
                  enrollments: { where: { userId: user.id } },
                  sections: { include: { lessons: true } }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { assignedAt: 'desc' }
  })

  // We need completions to calculate progress for each course
  const completions = await prisma.lessonCompletion.findMany({
    where: { userId: user.id }
  })
  const completionSet = new Set(completions.map(c => c.lessonId))

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">My Learning Plans</h1>
        <p className="text-muted-foreground mt-2">
          Track your required training and structured learning paths.
        </p>
      </div>

      {assignments.length === 0 ? (
        <Card className="bg-muted/10 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-primary">No assigned plans</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You do not have any learning plans assigned to you right now.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {assignments.map(assignment => {
            const plan = assignment.plan
            const items = plan.items

            // Calculate overall plan progress
            let completedCourses = 0
            const coursesWithStatus = items.map(item => {
              const course = item.course
              const enrollment = course.enrollments[0]
              
              const totalLessons = course.sections.flatMap(s => s.lessons).length
              const courseLessonIds = course.sections.flatMap(s => s.lessons.map(l => l.id))
              const completedCount = courseLessonIds.filter(id => completionSet.has(id)).length
              
              const isCompleted = totalLessons > 0 && completedCount === totalLessons
              if (isCompleted) completedCourses++
              
              return {
                ...item,
                enrollment,
                totalLessons,
                completedCount,
                isCompleted,
                progressPercentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
              }
            })

            const totalCourses = items.length
            const planProgress = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0

            return (
              <Card key={assignment.id} className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="bg-primary/5 border-b border-border/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <div>
                      <CardTitle className="text-xl font-bold">{plan.title}</CardTitle>
                      <CardDescription className="mt-2 text-base text-foreground/80">{plan.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        {plan.dueDate && (
                          <span className="flex items-center gap-1.5 px-2 py-1 bg-background/50 rounded-md border border-border/50">
                            <Calendar className="h-4 w-4" /> Due: {plan.dueDate.toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 px-2 py-1 bg-background/50 rounded-md border border-border/50">
                          <BookOpen className="h-4 w-4" /> {totalCourses} Courses
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="text-3xl font-bold text-primary">{planProgress}%</div>
                      <div className="text-sm text-muted-foreground mt-1 font-medium">Complete</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {totalCourses === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">This plan has no required courses yet.</div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {coursesWithStatus.map((item, index) => (
                        <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-secondary/10 transition-colors">
                          <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background border border-border/50 flex items-center justify-center text-sm font-medium text-muted-foreground shadow-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-primary">{item.course.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{item.course.summary}</p>
                              
                              <div className="flex items-center gap-4 mt-3 text-sm">
                                {item.isCompleted ? (
                                  <span className="flex items-center gap-1.5 text-success font-medium bg-success/10 px-2 py-0.5 rounded-full border border-success/20">
                                    <CheckCircle className="h-4 w-4" /> Completed
                                  </span>
                                ) : item.enrollment ? (
                                  <span className="flex items-center gap-1.5 text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                    <Clock className="h-4 w-4" /> In Progress ({item.progressPercentage}%)
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground px-2 py-0.5 rounded-full border border-dashed border-border/50">Not Started</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0">
                            {item.isCompleted ? (
                              <Button variant="outline" className="shadow-sm hover:scale-105 transition-transform rounded-full" asChild>
                                <Link href={`/courses/${item.courseId}`}>Review</Link>
                              </Button>
                            ) : item.enrollment ? (
                              <Button className="shadow-md shadow-primary/20 hover:scale-105 transition-transform rounded-full" asChild>
                                <Link href={`/courses/${item.courseId}`}>Resume</Link>
                              </Button>
                            ) : (
                              <Button variant="secondary" className="shadow-sm hover:scale-105 transition-transform rounded-full" asChild>
                                <Link href={`/catalogue`}>Find & Enroll</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

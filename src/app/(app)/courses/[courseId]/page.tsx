import { requireUser } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, CheckCircle } from "lucide-react"

export default async function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const user = await requireUser()
  
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
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
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary">Your Progress</h3>
              <p className="text-sm text-muted-foreground">{completedLessonsCount} of {totalLessons} lessons completed</p>
            </div>
            <div className="text-3xl font-bold text-primary">{progressPercentage}%</div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-bold border-b pb-2">Course Syllabus</h2>
        {course.sections.length === 0 ? (
           <p className="text-muted-foreground">This course has no content yet.</p>
        ) : (
          course.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {section.lessons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No lessons in this section.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {section.lessons.map(lesson => {
                      const isCompleted = lesson.completions.length > 0;
                      return (
                        <div key={lesson.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-success" />
                            ) : (
                              <BookOpen className="h-5 w-5 text-muted-foreground" />
                            )}
                            <h4 className="font-medium text-primary">{lesson.title}</h4>
                          </div>
                          {isEnrolled ? (
                             <Button variant={isCompleted ? "ghost" : "secondary"} size="sm" asChild>
                               <a href={`/courses/${course.id}/lessons/${lesson.id}`}>{isCompleted ? 'Review' : 'Start'}</a>
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

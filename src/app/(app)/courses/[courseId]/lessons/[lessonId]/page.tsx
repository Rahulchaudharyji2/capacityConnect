import { requireUser } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Download, FileText } from "lucide-react"
import Link from "next/link"
import { markLessonComplete } from "./actions"

export default async function LessonViewer({ params }: { params: { courseId: string, lessonId: string } }) {
  const user = await requireUser()
  
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          }
        }
      },
      enrollments: {
        where: { userId: user.id }
      },
      resources: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!course) return <div>Course not found</div>
  
  const userRoles = user.roles.map(r => r.role.name)
  const isEnrolled = course.enrollments.length > 0
  const isAuthorizedTrainer = userRoles.includes('TRAINER') && course.ownerId === user.id
  const isAdmin = userRoles.includes('ADMIN')

  if (!isEnrolled && !isAuthorizedTrainer && !isAdmin) {
    redirect(`/courses/${params.courseId}`)
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      section: true,
      completions: {
        where: { userId: user.id }
      },
      resources: true
    }
  })

  if (!lesson || lesson.section.courseId !== params.courseId) {
    return <div>Lesson not found</div>
  }

  const isCompleted = lesson.completions.length > 0;
  
  // Combine course-level and lesson-level resources
  const availableResources = [...course.resources, ...lesson.resources]

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="pl-0 text-muted-foreground">
          <Link href={`/courses/${params.courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Course
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{course.title}</span>
        <span>/</span>
        <span>{lesson.section.title}</span>
      </div>

      <h1 className="text-4xl font-bold text-primary">{lesson.title}</h1>

      <Card className="mt-8">
        <CardContent className="pt-6 prose max-w-none dark:prose-invert">
          {/* Note: In a production app, use a safe Markdown renderer like 'react-markdown' */}
          <div className="whitespace-pre-wrap">{lesson.content || "No content provided."}</div>
        </CardContent>
      </Card>

      {availableResources.length > 0 && (
        <Card className="mt-8 border-primary/20">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Download Materials
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-3">
            {availableResources.map(resource => (
              <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-primary">{resource.displayName}</span>
                  <span className="text-xs text-muted-foreground">{Math.round(resource.sizeBytes / 1024)} KB</span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/api/resources/${resource.id}`} download>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center mt-8 pt-8 border-t">
        <div className="flex gap-4">
           {isCompleted ? (
             <Button variant="secondary" disabled>
                <CheckCircle className="mr-2 h-4 w-4 text-success" /> Completed
             </Button>
           ) : (
             <form action={markLessonComplete.bind(null, params.courseId, params.lessonId)}>
               <Button type="submit">Mark as Complete</Button>
             </form>
           )}
        </div>
      </div>
    </div>
  )
}

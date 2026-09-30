import { requireRole, canManageCourse } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash, FileText } from "lucide-react"
import { addSection, addLesson, publishCourse } from "./actions"
import { ResourceUploadForm } from "@/components/trainer/ResourceUploadForm"
import { deleteResource } from "./resource-actions"
import { ResourceRetryButton } from "@/components/trainer/ResourceRetryButton"

export default async function CourseEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireRole(['TRAINER'])
  await canManageCourse(id)

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          }
        }
      },
      resources: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!course) return <div>Course not found</div>

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary">{course.title}</h1>
          <p className="text-muted-foreground mt-2">{course.isPublished ? "Published" : "Draft"}</p>
        </div>
        <div className="flex gap-2">
          {!course.isPublished && (
            <form action={publishCourse.bind(null, course.id)}>
              <Button type="submit" variant="default">Publish Course</Button>
            </form>
          )}
          <Button variant="outline">Archive</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Add New Section</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addSection.bind(null, course.id)} className="flex gap-4 items-end">
                <div className="flex-grow space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">Section Title</label>
                  <Input id="title" name="title" required placeholder="e.g. Module 1: Basics" />
                </div>
                <Button type="submit"><Plus className="h-4 w-4 mr-2"/> Add</Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            {course.sections.map((section) => (
              <Card key={section.id}>
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {section.lessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground mb-4">No lessons in this section.</p>
                  ) : (
                    <div className="flex flex-col gap-3 mb-6">
                      {section.lessons.map(lesson => (
                        <div key={lesson.id} className="border rounded p-3 bg-card">
                          <h4 className="font-medium text-primary">{lesson.title}</h4>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Add Lesson</h4>
                    <form action={addLesson.bind(null, course.id, section.id)} className="flex flex-col gap-3">
                      <Input name="title" required placeholder="Lesson Title" />
                      <Textarea name="content" required placeholder="Lesson Content (Markdown supported)" rows={3} />
                      <Button type="submit" size="sm" variant="secondary" className="self-end">Save Lesson</Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="md:col-span-1 flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Course Resources</CardTitle>
              <CardDescription>Upload reference materials for learners.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ResourceUploadForm courseId={course.id} />
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3">Attached Files</h4>
                {course.resources.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No resources uploaded.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {course.resources.map(resource => (
                      <div key={resource.id} className="flex flex-col gap-2 p-3 border rounded bg-card/50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex gap-2 items-center min-w-0">
                            <FileText className="h-4 w-4 flex-shrink-0 text-primary" />
                            <span className="text-sm font-medium truncate" title={resource.displayName}>
                              {resource.displayName}
                            </span>
                            {resource.indexingStatus === "SUCCESS" && <span className="bg-success/10 text-success text-[10px] px-1.5 py-0.5 rounded-full font-medium">Searchable</span>}
                            {resource.indexingStatus === "FAILED" && <span className="bg-destructive/10 text-destructive text-[10px] px-1.5 py-0.5 rounded-full font-medium">Failed</span>}
                            {resource.indexingStatus === "PENDING" && <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium">Pending</span>}
                          </div>
                          <form action={deleteResource.bind(null, course.id, resource.id)}>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" type="submit" title="Remove Resource">
                              <Trash className="h-3 w-3" />
                            </Button>
                          </form>
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-col gap-2 mt-1">
                          <span>{Math.round(resource.sizeBytes / 1024)} KB • {new Date(resource.createdAt).toLocaleDateString()}</span>
                          {resource.indexingStatus === "FAILED" && (
                            <ResourceRetryButton courseId={course.id} resourceId={resource.id} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

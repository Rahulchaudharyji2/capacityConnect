import { requireUser } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, Download, BookOpen, ChevronRight } from "lucide-react"
import Link from "next/link"

export default async function KnowledgeLibraryPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const user = await requireUser()
  const query = searchParams.q?.trim()

  const userRoles = user.roles.map(r => r.role.name)
  const isAdmin = userRoles.includes("ADMIN")
  const isTrainer = userRoles.includes("TRAINER")

  let results: any[] = []

  if (query && query.length >= 2) {
    // Construct safe Prisma query
    // Base conditions: indexing status SUCCESS, not archived, contains query
    const baseWhere = {
      indexingStatus: "SUCCESS",
      isArchived: false,
      OR: [
        { extractedText: { contains: query } },
        { displayName: { contains: query } }
      ]
    }

    let authWhere: any = {}

    if (isAdmin) {
      // Admin sees all
      authWhere = baseWhere
    } else if (isTrainer) {
      // Trainer sees owned courses OR enrolled courses
      authWhere = {
        ...baseWhere,
        OR: [
          { course: { ownerId: user.id } },
          { lesson: { section: { course: { ownerId: user.id } } } },
          { course: { enrollments: { some: { userId: user.id } } } },
          { lesson: { section: { course: { enrollments: { some: { userId: user.id } } } } } }
        ]
      }
    } else {
      // Learner sees only enrolled, published courses
      authWhere = {
        ...baseWhere,
        OR: [
          { course: { isPublished: true, enrollments: { some: { userId: user.id } } } },
          { lesson: { section: { course: { isPublished: true, enrollments: { some: { userId: user.id } } } } } }
        ]
      }
    }

    const rawResults = await prisma.resource.findMany({
      where: authWhere,
      include: {
        course: true,
        lesson: { include: { section: { include: { course: true } } } }
      },
      take: 20
    })

    // Process excerpts securely on server
    results = rawResults.map(resource => {
      let excerpt = ""
      if (resource.extractedText) {
        const textLower = resource.extractedText.toLowerCase()
        const queryLower = query.toLowerCase()
        const matchIndex = textLower.indexOf(queryLower)
        
        if (matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 60)
          const end = Math.min(resource.extractedText.length, matchIndex + query.length + 60)
          excerpt = (start > 0 ? "..." : "") + resource.extractedText.substring(start, end) + (end < resource.extractedText.length ? "..." : "")
        } else {
           excerpt = resource.extractedText.substring(0, 120) + "..."
        }
      }

      // Resolve context names
      const contextCourse = resource.course || resource.lesson?.section.course
      const contextLesson = resource.lesson

      return {
        id: resource.id,
        displayName: resource.displayName,
        sizeBytes: resource.sizeBytes,
        excerpt,
        courseName: contextCourse?.title,
        courseId: contextCourse?.id,
        lessonName: contextLesson?.title,
        lessonId: contextLesson?.id
      }
    })
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Knowledge Library</h1>
        <p className="text-muted-foreground mt-2">
          Search across all your enrolled course materials, documents, and reference PDFs.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="flex gap-2" method="GET" action="/knowledge">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                name="q"
                defaultValue={query}
                placeholder="Search for concepts, keywords, or document names..." 
                className="pl-9 h-12 text-lg"
                autoComplete="off"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8">Search</Button>
          </form>
        </CardContent>
      </Card>

      {!query ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-6" />
          <h3 className="text-xl font-medium text-primary">Start your research</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Enter a keyword above to instantly scan thousands of pages of training material attached to your courses.
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-primary">No results found for "{query}"</h3>
          <p className="text-muted-foreground mt-1">
            Try using different keywords or checking if the specific course is published.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Showing {results.length} results</h3>
          {results.map(result => (
            <Card key={result.id} className="overflow-hidden hover:border-primary/30 transition-colors">
              <CardContent className="p-0">
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="bg-primary/10 p-2 rounded-md h-fit">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-primary">{result.displayName}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-medium">
                          <span>{result.courseName}</span>
                          {result.lessonName && (
                            <>
                              <ChevronRight className="h-3 w-3" />
                              <span>{result.lessonName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                       <Button variant="outline" size="sm" asChild>
                         <Link href={result.lessonId ? `/courses/${result.courseId}/lessons/${result.lessonId}` : `/courses/${result.courseId}`}>
                            View Context
                         </Link>
                       </Button>
                       <Button size="sm" asChild>
                         <a href={`/api/resources/${result.id}`} download>
                           <Download className="h-4 w-4 mr-2" /> Download
                         </a>
                       </Button>
                    </div>
                  </div>
                  
                  {result.excerpt && (
                    <div className="mt-2 bg-muted/30 p-3 rounded text-sm text-foreground/80 leading-relaxed border border-border/50 font-serif">
                       "{result.excerpt}"
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

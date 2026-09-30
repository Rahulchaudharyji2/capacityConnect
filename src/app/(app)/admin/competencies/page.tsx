import { requireRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Archive } from "lucide-react"
import { createCompetency, archiveCompetency } from "./actions"

export default async function CompetenciesPage() {
  await requireRole(['ADMIN'])

  const competencies = await prisma.competency.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { courses: true }
      }
    }
  })

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-primary">Competency Framework</h1>
          <p className="text-muted-foreground mt-2">Define and manage organizational competencies.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add Competency</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createCompetency} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input id="name" name="name" required placeholder="e.g. Data Analysis" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="key" className="text-sm font-medium">Unique Key</label>
                  <Input id="key" name="key" required placeholder="e.g. COMP-DATA-01" className="font-mono text-sm" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category (Optional)</label>
                  <Input id="category" name="category" placeholder="e.g. Technical Skills" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                <Button type="submit" className="w-full mt-2">
                  <Plus className="mr-2 h-4 w-4" /> Create
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Active Competencies</CardTitle>
              <CardDescription>All defined competencies available for mapping.</CardDescription>
            </CardHeader>
            <CardContent>
              {competencies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No competencies defined yet.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {competencies.map(comp => (
                    <div key={comp.id} className={`flex items-start justify-between border-b pb-4 last:border-0 last:pb-0 ${comp.isArchived ? 'opacity-60' : ''}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-primary">{comp.name}</h3>
                          {comp.isArchived && <span className="text-xs bg-muted px-2 py-1 rounded">Archived</span>}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground mt-1">{comp.key}</div>
                        {comp.description && (
                          <p className="text-sm mt-2 text-foreground/80 line-clamp-2">{comp.description}</p>
                        )}
                        <div className="text-sm text-muted-foreground mt-3">
                          Mapped to {comp._count.courses} Courses
                        </div>
                      </div>
                      {!comp.isArchived && (
                        <form action={archiveCompetency.bind(null, comp.id)}>
                          <Button variant="ghost" size="sm" type="submit" title="Archive">
                            <Archive className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

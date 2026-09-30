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
          <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm sticky top-24">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <CardTitle>Add Competency</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={createCompetency} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input id="name" name="name" required placeholder="e.g. Data Analysis" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="key" className="text-sm font-medium">Unique Key</label>
                  <Input id="key" name="key" required placeholder="e.g. COMP-DATA-01" className="font-mono text-sm bg-background/50" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category (Optional)</label>
                  <Input id="category" name="category" placeholder="e.g. Technical Skills" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Description</label>
                  <Textarea id="description" name="description" rows={3} className="bg-background/50 resize-none" />
                </div>
                <Button type="submit" className="w-full mt-4 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                  <Plus className="mr-2 h-4 w-4" /> Create
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-background/40 backdrop-blur-xl border-white/10 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <CardTitle>Active Competencies</CardTitle>
              <CardDescription>All defined competencies available for mapping.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {competencies.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No competencies defined yet.</div>
              ) : (
                <div className="divide-y divide-border/50">
                  {competencies.map(comp => (
                    <div key={comp.id} className={`flex items-start justify-between p-6 hover:bg-secondary/10 transition-colors ${comp.isArchived ? 'opacity-60 grayscale' : ''}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg text-primary">{comp.name}</h3>
                          {comp.isArchived && <span className="text-xs bg-muted px-2 py-0.5 rounded-full border border-border/50">Archived</span>}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground mt-1.5 bg-background/50 inline-block px-2 py-0.5 rounded">{comp.key}</div>
                        {comp.description && (
                          <p className="text-sm mt-3 text-foreground/80 leading-relaxed">{comp.description}</p>
                        )}
                        <div className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary/40"></span>
                          Mapped to {comp._count.courses} Courses
                        </div>
                      </div>
                      {!comp.isArchived && (
                        <form action={archiveCompetency.bind(null, comp.id)}>
                          <Button variant="ghost" size="icon" type="submit" title="Archive" className="hover:bg-destructive/10 hover:text-destructive">
                            <Archive className="h-4 w-4" />
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

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, BookOpen, BarChart } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <header className="flex h-16 items-center justify-between border-b bg-card px-6 lg:px-12">
        <div className="font-bold text-xl text-primary flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Capacity Connect
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <a href="/dashboard">Explore Demo</a>
          </Button>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-primary text-primary-foreground py-20 px-6 lg:px-12 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">
            Building Skills. Strengthening Capability.
          </h1>
          <p className="text-lg lg:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            A unified digital platform that connects employees, trainers, learning resources, competency requirements and training outcomes.
          </p>
          <Button size="lg" variant="secondary" className="text-primary font-semibold" asChild>
            <a href="/dashboard">Enter the Platform</a>
          </Button>
          <p className="mt-4 text-xs opacity-75">
            *This is an independent prototype and not an official government application.
          </p>
        </section>

        <section className="py-20 px-6 lg:px-12 max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <BookOpen className="h-10 w-10 text-accent mb-2" />
              <CardTitle>Centralized Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage employee training and learning resources centrally with role-based learning plans.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <BarChart className="h-10 w-10 text-accent mb-2" />
              <CardTitle>Competency Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Map competencies to roles, identify training needs, and evaluate learning progress effectively.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <ShieldCheck className="h-10 w-10 text-accent mb-2" />
              <CardTitle>Secure & Governed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Maintain verified training records and ensure proper access control for sensitive organizational knowledge.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      
      <footer className="border-t bg-card py-6 px-6 lg:px-12 text-center text-sm text-muted-foreground">
        <p>Capacity Connect Prototype © 2026. For Demonstration Purposes Only.</p>
      </footer>
    </div>
  )
}

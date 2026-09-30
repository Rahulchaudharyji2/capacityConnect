import { Calendar } from "lucide-react"

export default function TrainingCalendar() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Training Calendar</h1>
        <p className="text-muted-foreground mt-2">
          View your upcoming training sessions and workshops.
        </p>
      </div>
      <div className="bg-background/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center min-h-[500px] shadow-sm">
        <div className="p-4 bg-primary/5 rounded-full mb-4">
          <Calendar className="h-12 w-12 text-primary/40" />
        </div>
        <h3 className="text-xl font-medium text-primary">Calendar view coming soon</h3>
        <p className="text-muted-foreground mt-2 max-w-md text-center">
          The interactive calendar module is currently under development. Soon you'll be able to schedule and join live training sessions directly from here.
        </p>
      </div>
    </div>
  )
}

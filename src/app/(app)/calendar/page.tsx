export default function TrainingCalendar() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Training Calendar</h1>
        <p className="text-muted-foreground mt-2">
          View your upcoming training sessions and workshops.
        </p>
      </div>
      <div className="bg-card border rounded-lg p-6 flex items-center justify-center min-h-[500px]">
        <p className="text-muted-foreground">Calendar view will be displayed here.</p>
      </div>
    </div>
  )
}

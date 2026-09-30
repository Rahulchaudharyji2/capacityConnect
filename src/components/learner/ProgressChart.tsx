"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function ProgressChart({ data }: { data: { name: string; progress: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground border border-dashed border-border/50 rounded-xl">
        Enroll in some courses to see your progress!
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ChartContainer
        config={{
          progress: {
            label: "Progress (%)",
            color: "hsl(var(--primary))",
          },
        }}
        className="h-full w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`} 
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="progress" fill="var(--color-progress)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { retryIndexing } from "@/app/(app)/trainer/courses/[id]/resource-actions"

interface Props {
  courseId: string
  resourceId: string
}

export function ResourceRetryButton({ courseId, resourceId }: Props) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRetry = async () => {
    setIsRetrying(true)
    setError(null)
    
    try {
      const result = await retryIndexing(courseId, resourceId)
      if (result.error) {
        setError(result.error)
      } else if (!result.success) {
        setError(result.message || "Failed to retry")
      }
    } catch (err: unknown) {
      setError("An unexpected error occurred.")
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRetry} 
        disabled={isRetrying}
        className="h-6 px-2 text-xs"
        title="Retry PDF text extraction"
      >
        {isRetrying ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
        Retry
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  )
}

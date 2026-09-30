"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react"

interface ResourceUploadFormProps {
  courseId: string
  lessonId?: string
}

export function ResourceUploadForm({ courseId, lessonId }: ResourceUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [displayName, setDisplayName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("courseId", courseId)
    if (lessonId) formData.append("lessonId", lessonId)
    if (displayName) formData.append("displayName", displayName)

    try {
      const res = await fetch("/api/resources/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file")
      }

      // Reset form on success
      setFile(null)
      setDisplayName("")
      // Force refresh to show new resource
      router.refresh()
    } catch (err: unknown) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4 border rounded-lg p-4 bg-card">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select PDF File (Max 10MB)</label>
        <Input 
          type="file" 
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={isUploading}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Display Name (Optional)</label>
        <Input 
          type="text" 
          placeholder="e.g. Course Syllabus"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={isUploading}
        />
      </div>

      {error && (
        <div className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <Button type="submit" disabled={!file || isUploading} className="w-full">
        {isUploading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
        ) : (
          <><Upload className="mr-2 h-4 w-4" /> Upload Resource</>
        )}
      </Button>
    </form>
  )
}

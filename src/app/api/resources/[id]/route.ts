import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { storage } from "@/lib/storage"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const resource = await prisma.resource.findUnique({
    where: { id: params.id },
    include: { course: true, lesson: true }
  })

  if (!resource || resource.isArchived) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const userRoles = user.roles.map(r => r.role.name)
  const isAdmin = userRoles.includes("ADMIN")
  const isOwner = userRoles.includes("TRAINER") && (resource.course?.ownerId === user.id)

  let isAuthorized = isAdmin || isOwner

  // If not admin or owner, verify enrollment
  if (!isAuthorized) {
    const courseId = resource.courseId || resource.lesson?.courseId
    if (courseId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId } }
      })
      if (enrollment) {
        isAuthorized = true
      }
    }
  }

  if (!isAuthorized) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const fileBuffer = await storage.read(resource.storageKey)
  if (!fileBuffer) {
    return new NextResponse("File missing from storage", { status: 500 })
  }

  const headers = new Headers()
  headers.set('Content-Type', resource.mimeType || 'application/octet-stream')
  headers.set('Content-Disposition', `attachment; filename="${resource.originalName}"`)
  headers.set('X-Content-Type-Options', 'nosniff') // Prevent MIME-sniffing
  headers.set('Content-Length', resource.sizeBytes.toString())

  return new NextResponse(fileBuffer, {
    status: 200,
    headers
  })
}

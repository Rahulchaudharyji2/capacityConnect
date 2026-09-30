import { prisma } from "./prisma"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

export async function getCurrentUser() {
  const jwtSecretStr = process.env.JWT_SECRET
  if (!jwtSecretStr || jwtSecretStr.length < 32) {
    throw new Error('CRITICAL: JWT_SECRET environment variable is missing or less than 32 characters.')
  }
  const cookieStore = await cookies()
  const token = cookieStore.get('demo_session_token')?.value
  
  if (!token) return null

  try {
    const secret = new TextEncoder().encode(jwtSecretStr)
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
      issuer: 'capacity-connect',
      audience: 'capacity-connect-users'
    })

    if (!payload.email) return null

    const user = await prisma.user.findFirst({
      where: {
        email: payload.email as string
      },
      include: {
        roles: {
          include: { role: true }
        },
        organization: true,
        organizationalUnit: true
      }
    })

    return user
  } catch (error) {
    // Token is invalid, expired, or tampered with
    return null
  }
}

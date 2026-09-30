"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete({
    name: 'demo_session_token',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true
  })
  
  redirect('/login')
}

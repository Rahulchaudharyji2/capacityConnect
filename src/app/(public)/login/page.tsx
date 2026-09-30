import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignJWT } from "jose";

export default function LoginPage() {
  async function loginAs(email: string) {
    "use server"
    
    // In production, this would be disabled or replaced by real OAuth/SSO
    // For this prototype, we retain the Demo Account selector
    const allowlist = [
      'learner@demo.capacityconnect.org',
      'trainer@demo.capacityconnect.org',
      'admin@demo.capacityconnect.org'
    ];
    if (!allowlist.includes(email)) throw new Error("Invalid demo user");
    
    // 1. Generate securely signed JWT
    const jwtSecretStr = process.env.JWT_SECRET
    if (!jwtSecretStr || jwtSecretStr.length < 32) {
      throw new Error('CRITICAL: JWT_SECRET environment variable is missing or less than 32 characters.')
    }
    const secret = new TextEncoder().encode(jwtSecretStr)
    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('capacity-connect')
      .setAudience('capacity-connect-users')
      .setExpirationTime('8h')
      .sign(secret)

    // 2. Set HttpOnly JWT cookie
    const cookieStore = await cookies();
    cookieStore.set('demo_session_token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60 // 8 hours
    });
    
    // 3. Clear old insecure cookie if it exists
    cookieStore.delete('demo_user_email');
    
    redirect('/dashboard');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted flex-col">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Capacity Connect Demo Login</CardTitle>
          <CardDescription>Select a demo role to proceed securely.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form action={loginAs.bind(null, 'learner@demo.capacityconnect.org')}>
            <Button type="submit" className="w-full">Sign in as Demo Learner</Button>
          </form>
          <form action={loginAs.bind(null, 'trainer@demo.capacityconnect.org')}>
            <Button type="submit" variant="secondary" className="w-full">Sign in as Demo Trainer</Button>
          </form>
          <form action={loginAs.bind(null, 'admin@demo.capacityconnect.org')}>
            <Button type="submit" variant="outline" className="w-full">Sign in as Demo Admin</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

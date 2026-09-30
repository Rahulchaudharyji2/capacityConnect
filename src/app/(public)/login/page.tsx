import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignJWT } from "jose";
import { BookOpen, User, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

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
    <div className="flex items-center justify-center min-h-screen bg-background flex-col relative overflow-hidden transition-colors duration-300">
      {/* Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute top-6 left-6 z-50">
        <Button variant="ghost" size="sm" className="rounded-full hover:bg-white/10" asChild>
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
        </Button>
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md bg-background/50 backdrop-blur-xl border-white/10 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-white/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-base mt-2">Sign in to your Capacity Connect account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pb-10 px-8">
          <form action={loginAs.bind(null, 'learner@demo.capacityconnect.org')}>
            <Button type="submit" className="w-full h-12 rounded-xl text-base shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              <User className="mr-2 h-5 w-5" /> Sign in as Learner
            </Button>
          </form>
          <form action={loginAs.bind(null, 'trainer@demo.capacityconnect.org')}>
            <Button type="submit" variant="secondary" className="w-full h-12 rounded-xl text-base bg-secondary/50 backdrop-blur-md border border-white/10 hover:bg-secondary/80 hover:scale-[1.02] transition-all">
              <User className="mr-2 h-5 w-5" /> Sign in as Trainer
            </Button>
          </form>
          <form action={loginAs.bind(null, 'admin@demo.capacityconnect.org')}>
            <Button type="submit" variant="outline" className="w-full h-12 rounded-xl text-base bg-transparent border-border/50 hover:bg-white/5 hover:scale-[1.02] transition-all">
              <User className="mr-2 h-5 w-5" /> Sign in as Admin
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-sm text-muted-foreground relative z-10">
        Secure demo environment
      </p>
    </div>
  )
}

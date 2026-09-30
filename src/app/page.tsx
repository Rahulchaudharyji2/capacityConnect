"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, BookOpen, BarChart, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, Variants } from "framer-motion"
import Link from "next/link"

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden transition-colors duration-300">
      {/* Subtle Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <header className="flex h-20 items-center justify-between border-b border-white/10 bg-background/50 backdrop-blur-md px-6 lg:px-12 sticky top-0 z-50">
        <div className="font-bold text-xl text-primary flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl backdrop-blur-md border border-white/10 shadow-sm">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          Capacity Connect
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="outline" className="hidden sm:inline-flex bg-background/30 backdrop-blur-md border-white/20 hover:bg-white/10 transition-all rounded-full px-6" asChild>
            <Link href="/dashboard">Explore Demo</Link>
          </Button>
          <Button className="rounded-full px-6 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full py-24 px-6 lg:px-12 text-center flex flex-col items-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Next-Generation Learning Platform
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
            Building Skills. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Strengthening Capability.
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            A unified digital platform that connects employees, trainers, learning resources, competency requirements, and training outcomes seamlessly.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="rounded-full px-8 h-14 text-base shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:shadow-primary/40 group" asChild>
              <Link href="/dashboard">
                Enter the Platform
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" className="rounded-full px-8 h-14 text-base bg-secondary/50 backdrop-blur-md border border-white/10 hover:bg-secondary/80 transition-all hover:scale-105" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </motion.div>
          
          <motion.p variants={itemVariants} className="mt-8 text-xs text-muted-foreground/60 max-w-md mx-auto">
            *This is an independent prototype and not an official government application.
          </motion.p>
        </motion.section>

        <section className="w-full py-20 px-6 lg:px-12 bg-secondary/20 border-t border-white/5 backdrop-blur-3xl relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3"
          >
            {[
              {
                icon: <BookOpen className="h-8 w-8 text-primary" />,
                title: "Centralized Learning",
                description: "Manage employee training and learning resources centrally with role-based learning plans."
              },
              {
                icon: <BarChart className="h-8 w-8 text-accent" />,
                title: "Competency Mapping",
                description: "Map competencies to roles, identify training needs, and evaluate learning progress effectively."
              },
              {
                icon: <ShieldCheck className="h-8 w-8 text-primary" />,
                title: "Secure & Governed",
                description: "Maintain verified training records and ensure proper access control for sensitive organizational knowledge."
              }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="h-full bg-background/40 backdrop-blur-xl border-white/10 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <CardHeader>
                    <div className="p-3 bg-white/5 w-fit rounded-2xl border border-white/5 mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>
      
      <footer className="border-t border-white/10 bg-background/50 backdrop-blur-md py-8 px-6 lg:px-12 text-center text-sm text-muted-foreground relative z-10">
        <p>Capacity Connect Prototype &copy; 2026. For Demonstration Purposes Only.</p>
      </footer>
    </div>
  )
}

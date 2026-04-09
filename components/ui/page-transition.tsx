"use client"

import { cn } from "@/lib/utils"

interface PageTransitionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function PageTransition({ children, className, ...props }: PageTransitionProps) {
  return (
    <div className={cn("animate-fade-in-up", className)} {...props}>
      {children}
    </div>
  )
}

export function StaggerContainer({ children, className, ...props }: PageTransitionProps) {
  return (
    <div className={cn("animate-in-stagger", className)} {...props}>
      {children}
    </div>
  )
}

import type React from "react"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
  className?: string
}

export function DashboardHeader({ heading, text, children, className }: DashboardHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2 pb-5", className)}>
      <h1 className="font-heading text-3xl font-bold leading-tight tracking-tighter md:text-4xl">{heading}</h1>
      {text && <p className="text-muted-foreground">{text}</p>}
      {children}
    </div>
  )
}

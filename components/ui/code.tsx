import type React from "react"
import { cn } from "@/lib/utils"

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {}

export function Code({ className, ...props }: CodeProps) {
  return <pre className={cn("bg-muted px-4 py-3 rounded-md font-mono text-sm overflow-auto", className)} {...props} />
}

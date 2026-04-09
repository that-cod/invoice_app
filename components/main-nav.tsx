"use client"

import type React from "react"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Home
      </Link>
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/invoices"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/invoices") ? "text-primary" : "text-muted-foreground",
        )}
      >
        Invoices
      </Link>
      <Link
        href="/clients"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname.startsWith("/clients") ? "text-primary" : "text-muted-foreground",
        )}
      >
        Clients
      </Link>
    </nav>
  )
}

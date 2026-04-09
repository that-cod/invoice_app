"use client"

import Link from "next/link"
import { FileText } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function SiteHeader() {
  const { user, isLoading } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm transition-transform duration-150 ease-out group-hover:scale-105">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden font-bold text-base sm:inline-block tracking-tight">
            FreeInvoiceIndia
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          {isLoading ? null : user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

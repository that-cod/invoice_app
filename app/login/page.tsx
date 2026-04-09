"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Loader2, LogIn, FileText, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [gstin, setGstin] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleLogin = async () => {
    setLoginError(null)
    if (!gstin || !password) {
      setLoginError("Please enter your GSTIN and password.")
      return
    }
    setIsLoading(true)
    try {
      const { error } = await signIn(gstin, password)
      if (error) {
        setLoginError(error)
        toast({ title: "Login failed", description: error, variant: "destructive" })
      }
    } catch {
      setLoginError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">FreeInvoiceIndia</span>
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold leading-tight">
            GST-compliant invoicing for Indian businesses — free forever.
          </h2>
          <p className="text-primary-foreground/70 text-base">
            Create professional invoices, auto-detect CGST/SGST/IGST, manage clients, and track your finances in one place.
          </p>
        </div>
        <p className="text-primary-foreground/50 text-sm">
          Trusted by Indian freelancers &amp; small businesses
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">FreeInvoiceIndia</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">Enter your credentials to access your account</p>
          </div>

          <div className="space-y-5">
            {loginError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input
                id="gstin"
                placeholder="e.g. 27AADCB2230M1ZT"
                value={gstin}
                onChange={(e) => { setGstin(e.target.value.toUpperCase()); setLoginError(null) }}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors duration-fast"
                  onClick={() => toast({ title: "Password Reset", description: "To reset your password, please contact support or re-register with the same GSTIN after deleting your account.", variant: "default" })}
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(null) }}
                autoComplete="current-password"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <Button className="w-full" disabled={isLoading} onClick={handleLogin}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign in
                </>
              )}
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors duration-fast">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

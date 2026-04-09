"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { CheckCircle2, Loader2, UserPlus, FileText, MapPin, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

const STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
  "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
  "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "18": "Assam", "19": "West Bengal",
  "20": "Jharkhand", "21": "Odisha", "22": "Chhattisgarh",
  "23": "Madhya Pradesh", "24": "Gujarat", "27": "Maharashtra",
  "29": "Karnataka", "30": "Goa", "32": "Kerala",
  "33": "Tamil Nadu", "36": "Telangana", "37": "Andhra Pradesh",
}

export default function SignupPage() {
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [gstin, setGstin] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [signupError, setSignupError] = useState<string | null>(null)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)

  const gstinUpper = gstin.toUpperCase().trim()
  const isGstinValid = GSTIN_REGEX.test(gstinUpper)
  const passwordsMatch = password.length >= 8 && password === confirmPassword

  const detectedState = useMemo(() => {
    if (gstinUpper.length >= 2) return STATE_CODES[gstinUpper.substring(0, 2)] || null
    return null
  }, [gstinUpper])

  const handleSignup = async () => {
    setSignupError(null)
    setAlreadyRegistered(false)
    if (!gstin || !password || !businessName) {
      setSignupError("Please fill in all required fields.")
      return
    }
    if (!isGstinValid) {
      setSignupError("Invalid GSTIN format. Example: 27AADCB2230M1ZT")
      return
    }
    if (password.length < 8) {
      setSignupError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirmPassword) {
      setSignupError("Passwords do not match.")
      return
    }
    setIsLoading(true)
    try {
      const { error } = await signUp(gstinUpper, password, businessName)
      if (error) {
        if (error.toLowerCase().includes("already registered") || error.toLowerCase().includes("gstin")) {
          setAlreadyRegistered(true)
          setSignupError("This GSTIN is already registered.")
        } else {
          setSignupError(error)
        }
        toast({ title: "Sign up failed", description: error, variant: "destructive" })
      }
    } catch {
      setSignupError("An unexpected error occurred. Please try again.")
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
        <div className="space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            Join thousands of Indian businesses managing finances for free.
          </h2>
          <ul className="space-y-3 text-primary-foreground/80">
            {["GST-compliant invoices in seconds", "Auto CGST/SGST/IGST detection", "Client & product management", "PDF download & email sharing"].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary-foreground/60 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-primary-foreground/50 text-sm">No credit card required · Free forever</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">FreeInvoiceIndia</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1">Enter your business details to get started</p>
          </div>

          <div className="space-y-5">
            {signupError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <span>{signupError}</span>
                  {alreadyRegistered && (
                    <span> <Link href="/login" className="font-medium underline underline-offset-4">Sign in instead</Link></span>
                  )}
                </div>
              </div>
            )}
            {/* GSTIN */}
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <div className="relative">
                <Input
                  id="gstin"
                  placeholder="e.g. 27AADCB2230M1ZT"
                  value={gstin}
                  onChange={(e) => { setGstin(e.target.value.toUpperCase()); setSignupError(null) }}
                  className={cn(isGstinValid && "border-emerald-500 focus-visible:ring-emerald-500/30")}
                  autoComplete="off"
                />
                {isGstinValid && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                )}
              </div>
              {gstinUpper.length > 0 && (
                isGstinValid && detectedState ? (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {detectedState}
                  </p>
                ) : gstinUpper.length > 2 ? (
                  <p className="text-xs text-destructive">Invalid GSTIN format</p>
                ) : null
              )}
            </div>

            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Your Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  confirmPassword.length > 0 && passwordsMatch && "border-emerald-500 focus-visible:ring-emerald-500/30",
                  confirmPassword.length > 0 && !passwordsMatch && password !== confirmPassword && "border-destructive",
                )}
                autoComplete="new-password"
                onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              />
            </div>

            <Button className="w-full" disabled={isLoading} onClick={handleSignup}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create account
                </>
              )}
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium underline underline-offset-4 hover:text-primary/80 transition-colors duration-fast">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

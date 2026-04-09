"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { updateBusinessProfile } from "@/app/actions/profile-actions"
import { Check, Loader2, ArrowRight, Palette } from "lucide-react"
import { cn } from "@/lib/utils"

const THEMES = [
  {
    id: "classic",
    name: "Classic",
    tag: "Professional & Minimal",
    description: "Clean serif design, perfect for corporate and B2B invoices",
    preview: (
      <div className="w-full h-36 bg-white rounded-lg border p-3 text-[8px] leading-tight">
        <div className="border-b pb-1 mb-1 flex justify-between">
          <div className="font-serif font-bold text-[10px]">ACME Corp</div>
          <div className="font-serif text-[10px] text-gray-600">TAX INVOICE</div>
        </div>
        <div className="flex justify-between mb-2 text-gray-500">
          <div>Bill To: Client Name</div>
          <div>INV-2026-0001</div>
        </div>
        <div className="border rounded overflow-hidden">
          <div className="bg-gray-50 px-1 py-0.5 flex gap-4 text-gray-500 font-medium">
            <span className="flex-1">Description</span><span>Qty</span><span>Rate</span><span>Total</span>
          </div>
          <div className="px-1 py-0.5 flex gap-4 border-t">
            <span className="flex-1">Service item</span><span>1</span><span>5,000</span><span>5,000</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "modern",
    name: "Modern",
    tag: "Bold & Contemporary",
    description: "Dark header band with strong typography, stands out in any inbox",
    preview: (
      <div className="w-full h-36 bg-white rounded-lg border overflow-hidden text-[8px] leading-tight">
        <div className="bg-slate-900 text-white px-3 py-2 flex justify-between items-center">
          <span className="font-bold text-[10px]">ACME Corp</span>
          <span className="text-[11px] font-bold tracking-wider">INVOICE</span>
        </div>
        <div className="p-2">
          <div className="flex gap-2 mb-2">
            <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[7px]">INV-2026-0001</span>
            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[7px]">Due: Mar 30</span>
          </div>
          <div className="border rounded overflow-hidden">
            <div className="bg-indigo-500 text-white px-1 py-0.5 flex gap-4 text-[7px]">
              <span className="flex-1">Item</span><span>Amount</span>
            </div>
            <div className="px-1 py-0.5 flex gap-4">
              <span className="flex-1">Service</span><span>₹5,000</span>
            </div>
            <div className="bg-slate-900 text-white px-1 py-0.5 flex gap-4 font-bold">
              <span className="flex-1">Total</span><span>₹5,900</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "gst",
    name: "GST India",
    tag: "Government Compliant",
    description: "Full GST-format with CGST/SGST/IGST columns and declaration text",
    preview: (
      <div className="w-full h-36 bg-white rounded-lg border p-2 text-[7px] leading-tight">
        <div className="text-center font-bold text-[9px] border-b pb-1 mb-1">TAX INVOICE</div>
        <div className="grid grid-cols-2 gap-1 mb-1 text-gray-600">
          <div>Seller: ACME Corp<br />GSTIN: 27AADCB2230M1ZT</div>
          <div>Buyer: Client Name<br />GSTIN: 29BBBBB0000B1Z3</div>
        </div>
        <div className="border text-[6px]">
          <div className="bg-gray-100 px-1 py-0.5 grid grid-cols-6 gap-1 font-medium">
            <span className="col-span-2">Description</span><span>HSN</span><span>CGST</span><span>SGST</span><span>Total</span>
          </div>
          <div className="px-1 py-0.5 grid grid-cols-6 gap-1 border-t">
            <span className="col-span-2">Item</span><span>8523</span><span>9%</span><span>9%</span><span>5,900</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "freelancer",
    name: "Freelancer",
    tag: "Creative & Minimal",
    description: "Soft, modern design ideal for services, consulting, and creative work",
    preview: (
      <div className="w-full h-36 bg-stone-50 rounded-lg border p-3 text-[8px] leading-tight relative overflow-hidden">
        <div className="absolute top-4 right-2 text-[40px] font-bold text-stone-200/40 select-none">INVOICE</div>
        <div className="font-serif font-bold text-[12px] text-stone-800 mb-2">ACME Corp</div>
        <div className="flex justify-between mb-2 text-gray-500">
          <div>Client Name</div><div>INV-2026-0001</div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between border-b border-stone-200 pb-0.5">
            <span>Consulting Services</span><span className="text-orange-700">₹5,000</span>
          </div>
          <div className="flex justify-between border-b border-stone-200 pb-0.5">
            <span>Tax (18%)</span><span className="text-orange-700">₹900</span>
          </div>
          <div className="flex justify-between font-bold pt-0.5">
            <span>Total</span><span className="text-orange-700">₹5,900</span>
          </div>
        </div>
      </div>
    ),
  },
]

export default function OnboardingThemePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { refreshUser } = useAuth()
  const [selectedTheme, setSelectedTheme] = useState("classic")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const { error } = await updateBusinessProfile({ selected_theme: selectedTheme, onboarding_complete: true })
      if (error) {
        toast({ title: "Error", description: "Failed to save theme", variant: "destructive" })
        return
      }
      await refreshUser()
      router.push("/dashboard")
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-4xl animate-fade-in-up">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
            <Palette className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Choose your invoice style</h1>
          <p className="text-muted-foreground text-sm mt-1">You can always change this later in Settings</p>
        </div>

        {/* Progress */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Step 2 of 2 — Invoice Theme</span>
            <span className="text-xs text-muted-foreground">100%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-slow ease-out-expo" style={{ width: "100%" }} />
          </div>
        </div>

        {/* Theme grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {THEMES.map((theme) => (
            <div
              key={theme.id}
              className={cn(
                "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-normal ease-out-expo hover:shadow-md hover:-translate-y-0.5",
                selectedTheme === theme.id
                  ? "border-primary ring-4 ring-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-muted-foreground/30"
              )}
              onClick={() => setSelectedTheme(theme.id)}
            >
              {selectedTheme === theme.id && (
                <div className="absolute top-3 right-3 h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
              <div className="mb-4 pointer-events-none">{theme.preview}</div>
              <h3 className="font-semibold text-sm">{theme.name}</h3>
              <p className="text-xs text-primary font-medium mt-0.5">{theme.tag}</p>
              <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-sm mx-auto">
          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Setting up your dashboard…</>
            ) : (
              <>Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>

      </div>
    </div>
  )
}

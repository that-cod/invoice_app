"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { updateBusinessProfile } from "@/app/actions/profile-actions"
import { Upload, Loader2, ArrowRight, Building2 } from "lucide-react"

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Chandigarh", "Dadra & Nagar Haveli", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
]

export default function OnboardingProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, refreshUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    business_name: "", owner_name: "", email: "", phone: "",
    address: "", city: "", state: "", pincode: "",
  })

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        business_name: user.business_name || "",
        state: user.state || "",
      }))
    }
  }, [user])

  const handleChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    const { business_name, owner_name, email, phone, address, city, state, pincode } = formData
    if (!business_name || !owner_name || !email || !phone || !address || !city || !state || !pincode) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      toast({ title: "Invalid phone", description: "Please enter a valid 10-digit phone number", variant: "destructive" })
      return
    }
    if (!/^[0-9]{6}$/.test(pincode)) {
      toast({ title: "Invalid pincode", description: "Please enter a valid 6-digit pincode", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      let logoUrl = user?.logo_url || null
      if (logoFile) {
        const logoFormData = new FormData()
        logoFormData.append("file", logoFile)
        const res = await fetch("/api/upload-logo", { method: "POST", body: logoFormData })
        const data = await res.json()
        if (data.url) logoUrl = data.url
      }
      const { error } = await updateBusinessProfile({ ...formData, logo_url: logoUrl, onboarding_complete: false })
      if (error) {
        toast({ title: "Error", description: "Failed to save profile", variant: "destructive" })
        return
      }
      await refreshUser()
      router.push("/onboarding/theme")
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-2xl animate-fade-in-up">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Set up your business profile</h1>
          <p className="text-muted-foreground text-sm mt-1">This information will appear on your invoices</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Step 1 of 2 — Business Profile</span>
            <span className="text-xs text-muted-foreground">50%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-slow ease-out-expo" style={{ width: "50%" }} />
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Business Details</CardTitle>
            <CardDescription>All fields marked * are required</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Name *</Label>
                <Input value={formData.business_name} onChange={(e) => handleChange("business_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Owner / Proprietor Name *</Label>
                <Input value={formData.owner_name} onChange={(e) => handleChange("owner_name", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input placeholder="10-digit mobile" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Full Business Address *</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Select value={formData.state} onValueChange={(val) => handleChange("state", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input placeholder="6 digits" value={formData.pincode} onChange={(e) => handleChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} />
              </div>
            </div>

            {/* Logo upload */}
            <div className="space-y-2">
              <Label>Business Logo <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-14 w-14 rounded-lg object-cover border shadow-sm" />
                ) : (
                  <div className="h-14 w-14 rounded-lg border bg-muted flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted transition-colors duration-fast">
                  <Upload className="h-4 w-4" />
                  {logoFile ? "Change logo" : "Upload logo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
              </div>
            </div>

            <Button className="w-full mt-2" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              ) : (
                <>Continue to Theme Selection <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

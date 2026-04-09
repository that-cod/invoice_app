"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { updateBusinessProfile } from "@/app/actions/profile-actions"
import { Upload, Check, Loader2, Building2, Palette, Save } from "lucide-react"
import { cn } from "@/lib/utils"

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Chandigarh", "Dadra & Nagar Haveli", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
]

const THEMES = [
  { id: "classic", name: "Classic", tag: "Professional & Minimal", accent: "bg-gray-100 border-gray-300" },
  { id: "modern", name: "Modern", tag: "Bold & Contemporary", accent: "bg-slate-900 border-slate-700" },
  { id: "gst", name: "GST India", tag: "Government Compliant", accent: "bg-green-600 border-green-700" },
  { id: "freelancer", name: "Freelancer", tag: "Creative & Minimal", accent: "bg-stone-100 border-stone-300" },
]

export default function SettingsPage() {
  const { toast } = useToast()
  const { user, refreshUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState("classic")

  const [formData, setFormData] = useState({
    business_name: "", owner_name: "", email: "", phone: "",
    address: "", city: "", state: "", pincode: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        business_name: user.business_name || "",
        owner_name: user.owner_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
      })
      setSelectedTheme(user.selected_theme || "classic")
      if (user.logo_url) setLogoPreview(user.logo_url)
    }
  }, [user])

  const handleChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)) }
  }

  const handleSaveProfile = async () => {
    setIsSubmitting(true)
    try {
      let logoUrl = user?.logo_url || null
      if (logoFile) {
        const fd = new FormData()
        fd.append("file", logoFile)
        const res = await fetch("/api/upload-logo", { method: "POST", body: fd })
        const data = await res.json()
        if (data.url) logoUrl = data.url
      }
      const { error } = await updateBusinessProfile({ ...formData, logo_url: logoUrl })
      if (error) {
        toast({ title: "Error", description: "Failed to save profile", variant: "destructive" })
      } else {
        await refreshUser()
        toast({ title: "Profile saved", description: "Your business profile has been updated." })
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveTheme = async () => {
    setIsSubmitting(true)
    try {
      const { error } = await updateBusinessProfile({ selected_theme: selectedTheme })
      if (error) {
        toast({ title: "Error", description: "Failed to save theme", variant: "destructive" })
      } else {
        await refreshUser()
        toast({ title: "Theme saved", description: "Your invoice theme has been updated." })
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardShell>
      <div className="animate-fade-in-up">
        <div className="pb-6 border-b">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and invoice preferences.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="animate-fade-in">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <Building2 className="h-3.5 w-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2">
            <Palette className="h-3.5 w-3.5" />
            Theme
          </TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ── */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Business Profile</CardTitle>
              <CardDescription>This information will appear on your invoices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input value={formData.business_name} onChange={(e) => handleChange("business_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Owner Name</Label>
                  <Input value={formData.owner_name} onChange={(e) => handleChange("owner_name", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea value={formData.address} onChange={(e) => handleChange("address", e.target.value)} className="resize-none" rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={formData.state} onValueChange={(val) => handleChange("state", val)}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input value={formData.pincode} onChange={(e) => handleChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} />
                </div>
              </div>

              {/* Logo */}
              <div className="space-y-2">
                <Label>Business Logo <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-14 w-14 rounded-lg object-cover border shadow-sm" />
                  ) : (
                    <div className="h-14 w-14 rounded-lg border bg-muted flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted transition-colors duration-fast">
                    <Upload className="h-4 w-4" />
                    {logoFile ? "Change logo" : "Upload logo"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={handleSaveProfile} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" />Save profile</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Theme Tab ── */}
        <TabsContent value="theme" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoice Theme</CardTitle>
              <CardDescription>Choose how your invoices look when sent to clients.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEMES.map((theme) => (
                  <div
                    key={theme.id}
                    className={cn(
                      "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-normal ease-out-expo hover:-translate-y-0.5",
                      selectedTheme === theme.id
                        ? "border-primary ring-4 ring-primary/10 shadow-sm"
                        : "border-border bg-card hover:border-muted-foreground/30 hover:shadow-sm"
                    )}
                    onClick={() => setSelectedTheme(theme.id)}
                  >
                    {selectedTheme === theme.id && (
                      <div className="absolute top-3 right-3 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    {/* Mini swatch */}
                    <div className={cn("h-8 w-full rounded-md mb-3 border", theme.accent)} />
                    <h3 className="font-semibold text-sm">{theme.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{theme.tag}</p>
                  </div>
                ))}
              </div>
              <div>
                <Button onClick={handleSaveTheme} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" />Save theme</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

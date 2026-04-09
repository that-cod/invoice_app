"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Camera } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getBusinessProfile, updateBusinessProfile, uploadBusinessLogo } from "@/app/actions/profile-actions"

export function BusinessProfile() {
  const [logo, setLogo] = useState<string | null>("/placeholder.svg?height=80&width=80")
  const [businessName, setBusinessName] = useState("Your Business Name")
  const [businessGstin, setBusinessGstin] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await getBusinessProfile()
      if (data) {
        setBusinessName(data.name || "Your Business Name")
        setBusinessGstin(data.gstin || "")
        if (data.logo_url) {
          setLogo(data.logo_url)
        }
      }
    }

    loadProfile()
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Preview the image
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogo(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)

    try {
      // First update the profile data
      await updateBusinessProfile({
        name: businessName,
        gstin: businessGstin,
      })

      // Then upload the logo if a new one was selected
      if (selectedFile) {
        await uploadBusinessLogo(selectedFile)
      }

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full md:w-auto">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-md border overflow-hidden flex items-center justify-center bg-background">
            {logo ? (
              <Image
                src={logo || "/placeholder.svg"}
                alt="Business Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-muted">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0">
                <Upload className="h-4 w-4" />
                <span className="sr-only">Upload logo</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Business Profile</DialogTitle>
                <DialogDescription>Upload your business logo and update your business name.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input id="business-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="business-gstin">Business GSTIN</Label>
                  <Input id="business-gstin" value={businessGstin} onChange={(e) => setBusinessGstin(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="logo">Business Logo</Label>
                  <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <h3 className="font-medium">{businessName}</h3>
          <p className="text-sm text-muted-foreground">GSTIN: {businessGstin || "Not set"}</p>
        </div>
      </CardContent>
    </Card>
  )
}

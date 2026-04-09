"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { createClient, updateClient } from "@/app/actions/client-actions"
import { toast } from "@/components/ui/use-toast"

export function ClientFormDialog({ children, client = null, onSuccess }: { children: React.ReactNode; client?: any; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: client?.name || "",
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
    gstin: client?.gstin || "",
  })

  const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const PHONE_REGEX = /^[6-9]\d{9}$/

  const validateField = (name: string, value: string) => {
    let msg = ""
    if (name === "name") {
      if (!value.trim()) msg = "Client name is required."
      else if (value.trim().length < 2) msg = "Name must be at least 2 characters."
    }
    if (name === "email" && value && !EMAIL_REGEX.test(value)) msg = "Enter a valid email address."
    if (name === "phone" && value && !PHONE_REGEX.test(value)) msg = "Enter a valid 10-digit Indian mobile number."
    if (name === "gstin" && value && !GSTIN_REGEX.test(value.toUpperCase())) msg = "Invalid GSTIN. Expected format: 27AADCB2230M1ZT"
    setErrors((prev) => ({ ...prev, [name]: msg }))
  }

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Client name is required."
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters."
    if (formData.email && !EMAIL_REGEX.test(formData.email)) newErrors.email = "Enter a valid email address."
    if (formData.phone && !PHONE_REGEX.test(formData.phone)) newErrors.phone = "Enter a valid 10-digit Indian mobile number."
    if (formData.gstin && !GSTIN_REGEX.test(formData.gstin.toUpperCase())) newErrors.gstin = "Invalid GSTIN. Expected format: 27AADCB2230M1ZT"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    validateField(e.target.name, e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAll()) return
    setIsSubmitting(true)

    try {
      if (client) {
        // Update existing client
        const { data, error } = await updateClient(client.id, formData)

        if (error) {
          toast({
            title: "Error",
            description: "Failed to update client. Please try again.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Client updated",
            description: `${formData.name} has been updated.`,
          })
          setOpen(false)
          onSuccess?.()
        }
      } else {
        // Create new client
        const { data, error } = await createClient(formData)

        if (error) {
          toast({
            title: "Error",
            description: "Failed to create client. Please try again.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Client added",
            description: `${formData.name} has been added to your clients.`,
          })
          setOpen(false)
          onSuccess?.()
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{client ? "Edit Client" : "Add New Client"}</DialogTitle>
            <DialogDescription>
              {client
                ? "Update the client's information below."
                : "Fill in the details to add a new client to your system."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="name" className="text-right pt-2">
                Name <span className="text-red-500">*</span>
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="email" className="text-right pt-2">
                Email
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="phone" className="text-right pt-2">
                Phone
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="10-digit mobile number"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="gstin" className="text-right pt-2">
                GSTIN
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="gstin"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 27AADCB2230M1ZT"
                  className={errors.gstin ? "border-red-500" : ""}
                />
                {errors.gstin && <p className="text-xs text-red-500">{errors.gstin}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="address" className="text-right pt-2">
                Address
              </Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : client ? "Save Changes" : "Add Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

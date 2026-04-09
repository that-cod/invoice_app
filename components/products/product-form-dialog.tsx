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
import { createProduct, updateProduct } from "@/app/actions/product-actions"
import { toast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProductFormDialog({ children, product = null, onSuccess }: { children: React.ReactNode; product?: any; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: product?.name || "",
    type: product?.type || "product",
    hsn_sac_code: product?.hsn_sac_code || "",
    rate: product?.rate || 0,
    gst_rate: product?.gst_rate || 18,
    description: product?.description || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (product) {
        // Update existing product
        const { data, error } = await updateProduct(product.id, formData)

        if (error) {
          toast({
            title: "Error",
            description: "Failed to update product",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "Product updated successfully",
          })
          setOpen(false)
          onSuccess?.()
        }
      } else {
        // Create new product
        const { data, error } = await createProduct(formData)

        if (error) {
          toast({
            title: "Error",
            description: "Failed to create product",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "Product created successfully",
          })
          setOpen(false)
          onSuccess?.()
        }
      }
    } catch {
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
            <DialogTitle>{product ? "Edit Product/Service" : "Add New Product/Service"}</DialogTitle>
            <DialogDescription>
              {product
                ? "Update the product/service information below."
                : "Fill in the details to add a new product or service to your catalog."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type *</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
                className="col-span-3 flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="product" id="product" />
                  <Label htmlFor="product">Product</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="service" id="service" />
                  <Label htmlFor="service">Service</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hsn_sac_code" className="text-right">
                {formData.type === "product" ? "HSN Code" : "SAC Code"}
              </Label>
              <Input
                id="hsn_sac_code"
                name="hsn_sac_code"
                value={formData.hsn_sac_code}
                onChange={handleChange}
                className="col-span-3"
                placeholder={formData.type === "product" ? "e.g., 8471" : "e.g., 998313"}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rate" className="text-right">
                Rate (₹) *
              </Label>
              <Input
                id="rate"
                name="rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.rate}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gst_rate" className="text-right">
                GST Rate *
              </Label>
              <Select
                value={formData.gst_rate.toString()}
                onValueChange={(value) => handleSelectChange("gst_rate", Number.parseInt(value))}
              >
                <SelectTrigger id="gst_rate" className="col-span-3">
                  <SelectValue placeholder="Select GST rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                  <SelectItem value="28">28%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : product ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

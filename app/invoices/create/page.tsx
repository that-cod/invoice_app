"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { InvoiceItemsTable } from "@/components/invoice/invoice-items-table"
import { InvoicePreview } from "@/components/invoice/invoice-preview"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { getClients } from "@/app/actions/client-actions"
import { getProducts } from "@/app/actions/product-actions"
import { getNextInvoiceNumber, createInvoice } from "@/app/actions/invoice-actions"
import { getBusinessProfile } from "@/app/actions/profile-actions"
import { useToast } from "@/components/ui/use-toast"
import { detectTaxType, getStateFromGSTIN } from "@/lib/gst"
import { useAuth } from "@/lib/auth-context"
import { Download } from "lucide-react"
import { downloadInvoiceAsPdf } from "@/lib/pdf"

export default function CreateInvoicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currency, setCurrency] = useState("INR")
  const [clients, setClients] = useState<Record<string, any>[]>([])
  const [products, setProducts] = useState<Record<string, any>[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sellerStateCode, setSellerStateCode] = useState("")
  const [clientStateCode, setClientStateCode] = useState("")
  const { user } = useAuth()
  const [selectedTheme, setSelectedTheme] = useState(user?.selected_theme || "classic")

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    clientId: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    clientGstin: "",
    notes: "",
    terms: "",
    applyGst: true,
    gstType: "CGST & SGST",
    placeOfSupply: "Maharashtra",
    isExport: false,
    exportType: "with-payment",
    portCode: "",
    shippingBillNumber: "",
    shippingBillDate: "",
    countryOfDestination: "",
    businessName: "",
    businessAddress: "",
    businessGstin: "",
    businessLogo: "",
  })

  const [items, setItems] = useState<Record<string, any>[]>([
    {
      id: 1,
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
      gstRate: 18,
      gstAmount: 0,
      totalAmount: 0,
      hsn_sac_code: "",
      product_id: null,
    },
  ])

  // Load initial data - Wrapped in useCallback
  const loadData = useCallback(async () => {
    setIsInitialLoading(true)
    const [invoiceNumberResult, clientsResult, productsResult, profileResult] = await Promise.all([
      getNextInvoiceNumber(),
      getClients(),
      getProducts(),
      getBusinessProfile(),
    ])

    if (invoiceNumberResult.data) {
      setInvoiceData((prev) => ({ ...prev, invoiceNumber: invoiceNumberResult.data as string }))
    }

    if (clientsResult.data) {
      setClients(clientsResult.data)
    }

    if (productsResult.data) {
      setProducts(productsResult.data)
    }

    const profileData = profileResult.data
    if (profileData) {
      setInvoiceData((prev) => ({
        ...prev,
        businessName: (profileData as any).business_name || (profileData as any).name || prev.businessName,
        businessAddress: (profileData as any).address || prev.businessAddress,
        businessGstin: (profileData as any).gstin || prev.businessGstin,
        businessLogo: (profileData as any).logo_url || prev.businessLogo,
        businessState: (profileData as any).state || "",
      }))
      if ((profileData as any).state_code) {
        setSellerStateCode((profileData as any).state_code)
      } else if ((profileData as any).gstin) {
        const state = getStateFromGSTIN((profileData as any).gstin)
        if (state) setSellerStateCode(state.code)
      }
    }
    setIsInitialLoading(false)
  }, [])

  // Load initial data on component mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Warn on unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [hasUnsavedChanges])

  // Update GST amounts whenever GST settings change (uses functional update to avoid items dependency)
  useEffect(() => {
    const applyGst = invoiceData.applyGst
    const isExport = invoiceData.isExport
    setItems((prev) =>
      prev.map((item) => {
        if (applyGst && !isExport) {
          const gstAmount = (item.amount * item.gstRate) / 100
          return { ...item, gstAmount, totalAmount: item.amount + gstAmount }
        }
        return { ...item, gstAmount: 0, totalAmount: item.amount }
      })
    )
  }, [invoiceData.applyGst, invoiceData.isExport])

  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1
    setItems([
      ...items,
      {
        id: newId,
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
        gstRate: 18,
        gstAmount: 0,
        totalAmount: 0,
        hsn_sac_code: "",
        product_id: null,
      },
    ])
  }

  const updateItem = (id: number, field: string, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }

        // If selecting a product from catalog
        if (field === "product_id" && value) {
          const selectedProduct = products.find((p) => p.id === value)
          if (selectedProduct) {
            updatedItem.description = selectedProduct.name
            updatedItem.rate = selectedProduct.rate
            updatedItem.gstRate = selectedProduct.gst_rate
            updatedItem.hsn_sac_code = selectedProduct.hsn_sac_code
            updatedItem.amount = updatedItem.quantity * selectedProduct.rate

            // Update GST amount and total if applicable
            if (invoiceData.applyGst && !invoiceData.isExport) {
              updatedItem.gstAmount = (updatedItem.amount * updatedItem.gstRate) / 100
              updatedItem.totalAmount = updatedItem.amount + updatedItem.gstAmount
            } else {
              updatedItem.gstAmount = 0
              updatedItem.totalAmount = updatedItem.amount
            }
          }
        }

        // Recalculate amount if quantity or rate changes
        if (field === "quantity" || field === "rate") {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate

          // Also update GST amount and total
          if (invoiceData.applyGst && !invoiceData.isExport) {
            updatedItem.gstAmount = (updatedItem.amount * updatedItem.gstRate) / 100
            updatedItem.totalAmount = updatedItem.amount + updatedItem.gstAmount
          } else {
            updatedItem.gstAmount = 0
            updatedItem.totalAmount = updatedItem.amount
          }
        }

        // Recalculate GST amount if GST rate changes
        if (field === "gstRate" && invoiceData.applyGst && !invoiceData.isExport) {
          updatedItem.gstAmount = (updatedItem.amount * updatedItem.gstRate) / 100
          updatedItem.totalAmount = updatedItem.amount + updatedItem.gstAmount
        }

        return updatedItem
      }
      return item
    })
    setItems(updatedItems)
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleInputChange = (field: string, value: unknown) => {
    setHasUnsavedChanges(true)
    setInvoiceData({
      ...invoiceData,
      [field]: value,
    })
  }

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find((client: Record<string, string>) => client.id === clientId)

    if (selectedClient) {
      setInvoiceData({
        ...invoiceData,
        clientId,
        clientName: selectedClient.name,
        clientEmail: selectedClient.email || "",
        clientAddress: selectedClient.address || "",
        clientGstin: selectedClient.gstin || "",
      })
      // Auto-detect client state from GSTIN
      if (selectedClient.gstin) {
        const state = getStateFromGSTIN(selectedClient.gstin)
        if (state) setClientStateCode(state.code)
      }
    }
  }

  // Auto-detect when client GSTIN is typed manually
  const handleClientGstinChange = (value: string) => {
    handleInputChange("clientGstin", value.toUpperCase())
    const state = getStateFromGSTIN(value.toUpperCase())
    if (state) {
      setClientStateCode(state.code)
    }
  }

  // Auto-detected tax type
  const detectedTaxType = sellerStateCode && clientStateCode
    ? detectTaxType(sellerStateCode, clientStateCode)
    : invoiceData.gstType === "IGST" ? "igst" as const : "cgst_sgst" as const

  const currencySymbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  }

  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
  const gstTotal =
    invoiceData.applyGst && !invoiceData.isExport ? items.reduce((sum, item) => sum + (item.gstAmount || 0), 0) : 0
  const total = subtotal + gstTotal

  // GST rates in India
  const gstRates = [0, 5, 12, 18, 28]

  // States for place of supply
  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Puducherry",
  ]

  const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

  const validateField = (field: string, value: string) => {
    let msg = ""
    if (field === "invoiceNumber" && !value.trim()) msg = "Invoice number is required."
    if (field === "invoiceDate" && !value) msg = "Invoice date is required."
    if (field === "dueDate") {
      if (!value) msg = "Due date is required."
      else if (value < invoiceData.invoiceDate) msg = "Due date cannot be before the invoice date."
    }
    if (field === "clientGstin" && value && !GSTIN_REGEX.test(value)) msg = "Invalid GSTIN. Expected format: 27AADCB2230M1ZT"
    setErrors((prev) => ({ ...prev, [field]: msg }))
  }

  const validateForm = (): string | null => {
    const newErrors: Record<string, string> = {}
    if (!invoiceData.invoiceNumber.trim()) newErrors.invoiceNumber = "Invoice number is required."
    if (!invoiceData.invoiceDate) newErrors.invoiceDate = "Invoice date is required."
    if (!invoiceData.dueDate) newErrors.dueDate = "Due date is required."
    else if (invoiceData.dueDate < invoiceData.invoiceDate) newErrors.dueDate = "Due date cannot be before the invoice date."
    if (invoiceData.clientGstin && !GSTIN_REGEX.test(invoiceData.clientGstin)) newErrors.clientGstin = "Invalid GSTIN. Expected format: 27AADCB2230M1ZT"
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return Object.values(newErrors)[0]
    const filledItems = items.filter((item) => item.description.trim())
    if (filledItems.length === 0) return "Add at least one item with a description."
    const zeroQty = filledItems.find((item) => item.quantity <= 0)
    if (zeroQty) return `Item "${zeroQty.description}": quantity must be greater than 0.`
    const negRate = filledItems.find((item) => item.rate < 0)
    if (negRate) return `Item "${negRate.description}": rate cannot be negative.`
    return null
  }

  const handleSaveInvoice = async (isDraft = true) => {
    const validationError = validateForm()
    if (validationError) {
      toast({ title: "Cannot save invoice", description: validationError, variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const invoiceToSave = {
        invoice_number: invoiceData.invoiceNumber,
        client_id: invoiceData.clientId || null,
        client_name: invoiceData.clientName || null,
        client_gstin: invoiceData.clientGstin || null,
        client_address: invoiceData.clientAddress || null,
        issue_date: invoiceData.invoiceDate,
        due_date: invoiceData.dueDate,
        status: isDraft ? "draft" : "sent",
        currency,
        subtotal,
        gst_total: gstTotal,
        total,
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        apply_gst: invoiceData.applyGst,
        gst_type: detectedTaxType === "cgst_sgst" ? "CGST & SGST" : "IGST",
        tax_type: detectedTaxType,
        theme: selectedTheme,
        place_of_supply: invoiceData.placeOfSupply,
        is_export: invoiceData.isExport,
        export_type: invoiceData.exportType,
        port_code: invoiceData.portCode,
        shipping_bill_number: invoiceData.shippingBillNumber,
        shipping_bill_date: invoiceData.shippingBillDate || null,
        country_of_destination: invoiceData.countryOfDestination,
      }

      // Only save items that have a description
      const itemsToSave = items
        .filter((item) => item.description.trim())
        .map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
          gst_rate: item.gstRate,
          gst_amount: item.gstAmount,
          total_amount: item.totalAmount,
          hsn_sac_code: item.hsn_sac_code,
          product_id: item.product_id,
        }))

      const { error } = await createInvoice(invoiceToSave, itemsToSave)

      if (error) {
        const msg =
          typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "Failed to save invoice. Please try again."
        toast({ title: "Error", description: msg, variant: "destructive" })
      } else {
        setHasUnsavedChanges(false)
        toast({
          title: isDraft ? "Draft saved" : "Invoice created",
          description: `Invoice #${invoiceData.invoiceNumber} ${isDraft ? "saved as draft" : "created"} successfully.`,
        })
        router.push("/invoices")
      }
    } catch (err) {
      console.error("Error in save invoice:", err)
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPdf = async () => {
    const element = document.getElementById("invoice-preview-container")
    if (!element) {
      toast({ title: "Switch to Preview tab first", description: "Open the Live Preview tab so the invoice is rendered before downloading.", variant: "destructive" })
      return
    }
    setIsDownloading(true)
    toast({ title: "Generating PDF…", description: "This may take a few seconds." })
    try {
      await downloadInvoiceAsPdf("invoice-preview-container", invoiceData.invoiceNumber || "invoice")
      toast({ title: "Downloaded", description: `${invoiceData.invoiceNumber || "invoice"}.pdf saved.` })
    } catch {
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Create Invoice" text="Create a new invoice for your client." />

      <Tabs defaultValue="form" className="space-y-4">
        <TabsList>
          <TabsTrigger value="form">Invoice Form</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Enter your client's details for the invoice.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-select">Select Client</Label>
                  <Select onValueChange={handleClientChange} value={invoiceData.clientId}>
                    <SelectTrigger id="client-select">
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input
                      id="client-name"
                      placeholder="Enter client name"
                      value={invoiceData.clientName}
                      onChange={(e) => handleInputChange("clientName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Client Email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="client@example.com"
                      value={invoiceData.clientEmail}
                      onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-address">Client Address</Label>
                  <Textarea
                    id="client-address"
                    placeholder="Enter client address"
                    value={invoiceData.clientAddress}
                    onChange={(e) => handleInputChange("clientAddress", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-gstin">Client GSTIN (for B2B transactions)</Label>
                  <Input
                    id="client-gstin"
                    placeholder="e.g., 27AADCB2230M1ZT"
                    value={invoiceData.clientGstin}
                    onChange={(e) => handleClientGstinChange(e.target.value)}
                    onBlur={(e) => validateField("clientGstin", e.target.value)}
                    className={errors.clientGstin ? "border-red-500" : ""}
                  />
                  {errors.clientGstin && <p className="text-xs text-red-500">{errors.clientGstin}</p>}
                  {!errors.clientGstin && invoiceData.clientGstin && clientStateCode && (
                    <p className="text-xs text-green-600">
                      State detected: {getStateFromGSTIN(invoiceData.clientGstin)?.name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>Set the invoice number, date, and currency.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-number">Invoice Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="invoice-number"
                      placeholder="INV-001"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                      onBlur={(e) => validateField("invoiceNumber", e.target.value)}
                      className={errors.invoiceNumber ? "border-red-500" : ""}
                    />
                    {errors.invoiceNumber && <p className="text-xs text-red-500">{errors.invoiceNumber}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice-date">Invoice Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="invoice-date"
                      type="date"
                      value={invoiceData.invoiceDate}
                      onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
                      onBlur={(e) => validateField("invoiceDate", e.target.value)}
                      className={errors.invoiceDate ? "border-red-500" : ""}
                    />
                    {errors.invoiceDate && <p className="text-xs text-red-500">{errors.invoiceDate}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date <span className="text-red-500">*</span></Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                      onBlur={(e) => validateField("dueDate", e.target.value)}
                      className={errors.dueDate ? "border-red-500" : ""}
                    />
                    {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Invoice Style</Label>
                    <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="gst">GST India</SelectItem>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      defaultValue="INR"
                      onValueChange={(value) => {
                        setCurrency(value)
                        handleInputChange("currency", value)
                      }}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                        <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-terms">Payment Terms</Label>
                    <Select defaultValue="15">
                      <SelectTrigger id="payment-terms">
                        <SelectValue placeholder="Select terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Due on Receipt</SelectItem>
                        <SelectItem value="15">Net 15</SelectItem>
                        <SelectItem value="30">Net 30</SelectItem>
                        <SelectItem value="60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Type</CardTitle>
                <CardDescription>Configure invoice type and tax settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-export"
                    checked={invoiceData.isExport}
                    onCheckedChange={(checked) => handleInputChange("isExport", checked)}
                  />
                  <Label htmlFor="is-export">This is an Export Invoice</Label>
                </div>

                {invoiceData.isExport ? (
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="export-type">Export Type</Label>
                        <Select
                          defaultValue="with-payment"
                          onValueChange={(value) => handleInputChange("exportType", value)}
                        >
                          <SelectTrigger id="export-type">
                            <SelectValue placeholder="Select export type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="with-payment">With Payment of IGST</SelectItem>
                            <SelectItem value="without-payment">Without Payment of IGST (Under Bond/LUT)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country-of-destination">Country of Destination</Label>
                        <Input
                          id="country-of-destination"
                          placeholder="e.g., United States"
                          value={invoiceData.countryOfDestination}
                          onChange={(e) => handleInputChange("countryOfDestination", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="port-code">Port Code</Label>
                        <Input
                          id="port-code"
                          placeholder="e.g., INBOM1"
                          value={invoiceData.portCode}
                          onChange={(e) => handleInputChange("portCode", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shipping-bill-number">Shipping Bill Number</Label>
                        <Input
                          id="shipping-bill-number"
                          placeholder="e.g., SB12345678"
                          value={invoiceData.shippingBillNumber}
                          onChange={(e) => handleInputChange("shippingBillNumber", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shipping-bill-date">Shipping Bill Date</Label>
                        <Input
                          id="shipping-bill-date"
                          type="date"
                          value={invoiceData.shippingBillDate}
                          onChange={(e) => handleInputChange("shippingBillDate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="apply-gst"
                        checked={invoiceData.applyGst}
                        onCheckedChange={(checked) => handleInputChange("applyGst", checked)}
                      />
                      <Label htmlFor="apply-gst">Apply GST to this invoice</Label>
                    </div>

                    {invoiceData.applyGst && (
                      <div className="space-y-4 pt-4">
                        <div className="p-3 bg-muted rounded-md text-sm">
                          <span className="font-medium">Tax Type (Auto-detected): </span>
                          {detectedTaxType === 'cgst_sgst'
                            ? 'CGST + SGST (Same state transaction)'
                            : 'IGST (Interstate transaction)'}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="place-of-supply">Place of Supply</Label>
                          <Select
                            value={invoiceData.placeOfSupply}
                            onValueChange={(value) => handleInputChange("placeOfSupply", value)}
                          >
                            <SelectTrigger id="place-of-supply">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {indianStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
                <CardDescription>Add items to your invoice.</CardDescription>
              </CardHeader>
              <CardContent>
                <InvoiceItemsTable
                  items={items}
                  updateItem={updateItem}
                  removeItem={removeItem}
                  currencySymbol={currencySymbols[currency]}
                  showGst={invoiceData.applyGst && !invoiceData.isExport}
                  gstRates={gstRates}
                  products={products}
                  showHsnSac={true}
                />
                <Button variant="outline" className="mt-4" onClick={addItem}>
                  Add Item
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="w-full flex justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {currencySymbols[currency]}
                      {subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>

                {invoiceData.applyGst && !invoiceData.isExport && (
                  <div className="w-full flex justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">GST</p>
                    </div>
                    <div>
                      <p className="text-lg font-medium">
                        {currencySymbols[currency]}
                        {gstTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="w-full flex justify-between border-t pt-4">
                  <div>
                    <p className="text-sm font-medium">Total</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">
                      {currencySymbols[currency]}
                      {total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes & Terms</CardTitle>
                <CardDescription>Add any additional notes or terms to your invoice.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any notes for the client"
                    value={invoiceData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    placeholder="Enter your terms and conditions"
                    value={invoiceData.terms}
                    onChange={(e) => handleInputChange("terms", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => handleSaveInvoice(true)} disabled={isSaving || isInitialLoading}>
                {isSaving ? "Saving..." : "Save as Draft"}
              </Button>
              <Button onClick={() => handleSaveInvoice(false)} disabled={isSaving || isInitialLoading}>
                {isSaving ? "Creating..." : isInitialLoading ? "Loading..." : "Create Invoice"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="flex justify-end mb-3">
            <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isDownloading}>
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Generating…" : "Download PDF"}
            </Button>
          </div>
          <InvoicePreview
            invoiceData={{...invoiceData, taxType: detectedTaxType, gstType: detectedTaxType === 'cgst_sgst' ? 'CGST & SGST' : 'IGST'}}
            items={items}
            currency={currency}
            currencySymbol={currencySymbols[currency]}
            subtotal={subtotal}
            gstTotal={gstTotal}
            total={total}
            taxType={detectedTaxType}
            theme={selectedTheme}
          />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

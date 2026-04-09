"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getInvoiceById, updateInvoiceStatus } from "@/app/actions/invoice-actions"
import { getBusinessProfile } from "@/app/actions/profile-actions"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Download, Printer, Send, Edit, Link2, Mail } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { InvoicePreview } from "@/components/invoice/invoice-preview"
import { Skeleton } from "@/components/ui/skeleton"
import { Card as SkeletonCard, CardContent } from "@/components/ui/card"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function InvoiceViewPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Record<string, unknown> | null>(null)
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailTo, setEmailTo] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const currencySymbols: Record<string, string> = {
    INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥",
  }

  useEffect(() => {
    async function loadInvoice() {
      setIsLoading(true)
      try {
        const [invoiceResult, profileResult] = await Promise.all([
          getInvoiceById(params.id as string),
          getBusinessProfile(),
        ])

        if (invoiceResult.error) {
          toast({ title: "Error", description: "Failed to load invoice.", variant: "destructive" })
          router.push("/invoices")
          return
        }

        if (invoiceResult.data) {
          setInvoice(invoiceResult.data)
          setItems((invoiceResult.data as Record<string, unknown>).items as Record<string, unknown>[] || [])
        }
        if (profileResult.data) {
          setProfile(profileResult.data)
        }
      } catch {
        toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) loadInvoice()
  }, [params.id, router])

  const handleStatusChange = async (status: string) => {
    setIsUpdating(true)
    try {
      const { error } = await updateInvoiceStatus(params.id as string, status)
      if (error) {
        toast({ title: "Error", description: "Failed to update status.", variant: "destructive" })
      } else {
        toast({ title: "Success", description: `Invoice marked as ${status}.` })
        setInvoice((prev) => prev ? { ...prev, status } : prev)
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDownload = async () => {
    const element = document.getElementById('invoice-preview-container')
    if (!element) return

    toast({ title: "Processing", description: "Generating PDF..." })

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${(invoice as Record<string, unknown>)?.invoice_number || 'invoice'}.pdf`)

      toast({ title: "Success", description: "PDF downloaded." })
    } catch {
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" })
    }
  }

  const handlePrint = () => {
    const content = document.getElementById('invoice-preview-container')
    if (!content) return
    const printWindow = window.open('', '_blank')
    printWindow?.document.write(`
      <html><head><title>Invoice</title>
      <style>body{margin:0;padding:0;} @media print{body{margin:0;}}</style>
      </head><body>${content.innerHTML}</body></html>
    `)
    printWindow?.document.close()
    printWindow?.focus()
    printWindow?.print()
    printWindow?.close()
  }

  const handleCopyLink = async () => {
    if (!invoice) return
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/invoice/${(invoice as Record<string, unknown>).share_id}`
    await navigator.clipboard.writeText(shareUrl)
    toast({ title: 'Link copied!', description: 'Share link copied to clipboard.' })
  }

  const handleSendEmail = async () => {
    if (!invoice || !emailTo) return
    setIsSendingEmail(true)

    try {
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/invoice/${(invoice as Record<string, unknown>).share_id}`
      const inv = invoice as Record<string, unknown>
      const clients = inv.clients as Record<string, unknown> | undefined

      const res = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          clientName: clients?.name || '',
          businessName: profile?.business_name || '',
          invoiceNumber: inv.invoice_number,
          shareLink: shareUrl,
        }),
      })

      if (res.ok) {
        toast({ title: "Email sent", description: `Invoice emailed to ${emailTo}.` })
        setEmailDialogOpen(false)
      } else {
        toast({ title: "Error", description: "Failed to send email. Check your RESEND_API_KEY.", variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to send email.", variant: "destructive" })
    } finally {
      setIsSendingEmail(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-between pb-2">
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-24" />)}
          </div>
        </div>
        <div className="flex gap-6 flex-wrap">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-28" />)}
        </div>
        <SkeletonCard>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-40 w-full mt-4" />
            <div className="flex justify-end">
              <Skeleton className="h-8 w-40" />
            </div>
          </CardContent>
        </SkeletonCard>
      </DashboardShell>
    )
  }

  if (!invoice) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Invoice Not Found" text="The requested invoice could not be found." />
        <Button asChild>
          <Link href="/invoices"><ArrowLeft className="mr-2 h-4 w-4" />Back to Invoices</Link>
        </Button>
      </DashboardShell>
    )
  }

  const inv = invoice as Record<string, unknown>
  const clients = inv.clients as Record<string, unknown> | undefined

  const invoiceData = {
    invoiceNumber: inv.invoice_number as string,
    invoiceDate: new Date(inv.issue_date as string).toLocaleDateString(),
    dueDate: new Date(inv.due_date as string).toLocaleDateString(),
    clientName: (clients?.name as string) || '',
    clientEmail: (clients?.email as string) || '',
    clientAddress: (clients?.address as string) || '',
    clientGstin: (clients?.gstin as string) || '',
    notes: (inv.notes as string) || '',
    terms: (inv.terms as string) || '',
    applyGst: inv.apply_gst as boolean,
    gstType: (inv.gst_type as string) || 'CGST & SGST',
    taxType: (inv.tax_type as string) || 'cgst_sgst',
    placeOfSupply: (inv.place_of_supply as string) || '',
    isExport: inv.is_export as boolean,
    businessName: (profile?.business_name as string) || '',
    businessAddress: (profile?.address as string) || '',
    businessGstin: (profile?.gstin as string) || '',
    businessLogo: (profile?.logo_url as string) || '',
    businessState: (profile?.state as string) || '',
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={inv.is_export ? "Export Invoice" : "Invoice"}
        text={`Invoice #${inv.invoice_number}`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Button asChild variant="outline" size="sm">
            <Link href="/invoices"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            <Link2 className="mr-2 h-4 w-4" />Copy Share Link
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            setEmailTo((clients?.email as string) || '')
            setEmailDialogOpen(true)
          }}>
            <Mail className="mr-2 h-4 w-4" />Email
          </Button>
          <Button size="sm" asChild>
            <Link href={`/invoices/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />Edit
            </Link>
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge
                variant={
                  inv.status === "paid" ? "default"
                    : inv.status === "sent" ? "secondary"
                      : inv.status === "overdue" ? "destructive"
                        : "outline"
                }
                className="mt-1"
              >
                {(inv.status as string).charAt(0).toUpperCase() + (inv.status as string).slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Issue Date</p>
              <p className="text-sm">{new Date(inv.issue_date as string).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Due Date</p>
              <p className="text-sm">{new Date(inv.due_date as string).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total</p>
              <p className="text-sm font-bold">
                {currencySymbols[inv.currency as string] || "₹"}
                {(inv.total as number)?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {["draft", "sent", "paid", "overdue"].map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(s)}
                disabled={inv.status === s || isUpdating}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <InvoicePreview
            invoiceData={invoiceData}
            items={items}
            currencySymbol={currencySymbols[inv.currency as string] || "₹"}
            subtotal={inv.subtotal as number}
            gstTotal={inv.gst_total as number}
            total={inv.total as number}
            theme={(inv.theme as string) || 'classic'}
            taxType={(inv.tax_type as 'cgst_sgst' | 'igst') || 'cgst_sgst'}
          />
        </Card>
      </div>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Send to</Label>
              <Input
                type="email"
                placeholder="client@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={isSendingEmail || !emailTo}>
              {isSendingEmail ? "Sending..." : "Send Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

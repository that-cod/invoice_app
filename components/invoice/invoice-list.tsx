"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download, MoreHorizontal, PlusCircle, FileText } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInvoices, updateInvoiceStatus, deleteInvoice, getInvoiceById } from "@/app/actions/invoice-actions"
import { jsPDF } from "jspdf"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Record<string, any>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadInvoices() {
      setIsLoading(true)
      const { data } = await getInvoices()
      if (data) {
        setInvoices(data)
      }
      setIsLoading(false)
    }

    loadInvoices()
  }, [])

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await updateInvoiceStatus(id, status)
    if (!error) {
      setInvoices(invoices.map((invoice) => (invoice.id === id ? { ...invoice, status } : invoice)))
    }
  }

  const handleDownloadPdf = async (invoiceId: string) => {
    const { data, error } = await getInvoiceById(invoiceId)
    if (error || !data) return
    const inv = data as Record<string, any>
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    pdf.setFontSize(18)
    pdf.text(`Invoice ${inv.invoice_number}`, 20, 20)
    pdf.setFontSize(11)
    pdf.text(`Client: ${inv.clients?.name || "N/A"}`, 20, 32)
    pdf.text(`Date: ${new Date(inv.issue_date).toLocaleDateString()}`, 20, 39)
    pdf.text(`Due: ${new Date(inv.due_date).toLocaleDateString()}`, 20, 46)
    pdf.text(`Status: ${inv.status}`, 20, 53)
    pdf.text(`Total: \u20B9${Number(inv.total).toLocaleString("en-IN")}`, 20, 60)
    const items: Record<string, any>[] = inv.items || []
    if (items.length > 0) {
      let y = 73
      pdf.setFontSize(10)
      pdf.text("Description", 20, y)
      pdf.text("Qty", 110, y)
      pdf.text("Rate", 135, y)
      pdf.text("Amount", 160, y)
      y += 5
      pdf.line(20, y, 190, y)
      y += 5
      for (const item of items) {
        pdf.text(String(item.description || ""), 20, y)
        pdf.text(String(item.quantity), 110, y)
        pdf.text(String(item.rate), 135, y)
        pdf.text(String(item.amount), 160, y)
        y += 6
      }
    }
    pdf.save(`${inv.invoice_number || "invoice"}.pdf`)
  }

  const handleDeleteInvoice = async (id: string, invoiceNumber: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      const { success } = await deleteInvoice(id)
      if (success) {
        setInvoices(invoices.filter((invoice) => invoice.id !== id))
        toast({ title: "Invoice deleted", description: `Invoice ${invoiceNumber} has been deleted.` })
      } else {
        toast({ title: "Cannot delete", description: "This invoice could not be deleted.", variant: "destructive" })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="h-12 border-b px-4 flex items-center bg-muted/30">
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <div className="p-4 space-y-4">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                  <div className="rounded-full bg-muted p-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">No invoices yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Create your first invoice to get started.</p>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/invoices/create">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Invoice
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.clients?.name || "Unknown Client"}</TableCell>
                <TableCell>₹{invoice.total.toLocaleString("en-IN")}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.status === "paid"
                        ? "default"
                        : invoice.status === "pending" || invoice.status === "draft"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(invoice.issue_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/invoices/${invoice.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadPdf(invoice.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/invoices/${invoice.id}`}>Edit / View</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "draft")}>
                        Mark as Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "sent")}>
                        Mark as Sent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, "paid")}>
                        Mark as Paid
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice.id, invoice.invoice_number)} className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

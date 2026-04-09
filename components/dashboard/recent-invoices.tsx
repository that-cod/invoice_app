"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getRecentInvoices } from "@/app/actions/dashboard-actions"
import { Skeleton } from "@/components/ui/skeleton"

type RecentInvoice = {
  id: string
  invoice_number: string
  issue_date: string
  status: string
  total: number
  clients: { name: string } | null
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  pending: "secondary",
  overdue: "destructive",
}

export function RecentInvoices() {
  const [invoices, setInvoices] = useState<RecentInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRecentInvoices().then(({ data }) => {
      if (data) setInvoices(data as RecentInvoice[])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">No invoices yet.</p>
    )
  }

  return (
    <div className="space-y-6">
      {invoices.map((invoice) => {
        const clientName = invoice.clients?.name || "Unknown Client"
        const initials = clientName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)

        return (
          <div key={invoice.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1 flex-1 min-w-0">
              <p className="text-sm font-medium leading-none truncate">{clientName}</p>
              <p className="text-sm text-muted-foreground">{invoice.invoice_number}</p>
            </div>
            <div className="ml-auto flex flex-col items-end gap-1 shrink-0">
              <span className="font-medium text-sm">
                ₹{Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <Badge variant={statusVariant[invoice.status] ?? "outline"} className="text-xs capitalize">
                {invoice.status}
              </Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}

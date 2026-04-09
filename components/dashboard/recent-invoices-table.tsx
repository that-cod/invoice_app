"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { getRecentInvoices } from "@/app/actions/dashboard-actions"

export function RecentInvoicesTable() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getRecentInvoices()
      if (result.data) setInvoices(result.data)
      setIsLoading(false)
    }
    load()
  }, [])

  if (isLoading) {
    return <div className="py-4 text-center text-muted-foreground">Loading...</div>
  }

  if (!invoices || invoices.length === 0) {
    return <div className="text-center py-4">No invoices found</div>
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <div key={invoice.id} className="flex items-center justify-between border-b pb-3">
          <div>
            <Link href={`/invoices/${invoice.id}`} className="font-medium hover:underline">
              {invoice.invoice_number}
            </Link>
            <div className="text-sm text-muted-foreground">{invoice.clients?.name}</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="font-medium">₹{invoice.total.toLocaleString("en-IN")}</div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  invoice.status === "paid" ? "success" : invoice.status === "overdue" ? "destructive" : "outline"
                }
              >
                {invoice.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(invoice.issue_date), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

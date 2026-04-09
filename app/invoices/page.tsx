import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { InvoiceList } from "@/components/invoice/invoice-list"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function InvoicesPage() {
  return (
    <DashboardShell>
      <div className="animate-fade-in-up flex items-center justify-between pb-6 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage your GST invoices.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/invoices/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>
      <div className="animate-fade-in">
        <InvoiceList />
      </div>
    </DashboardShell>
  )
}

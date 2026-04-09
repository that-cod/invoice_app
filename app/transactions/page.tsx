import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BankStatementUpload } from "@/components/transactions/bank-statement-upload"
import { TransactionList } from "@/components/transactions/transaction-list"

export default function TransactionsPage() {
  return (
    <DashboardShell>
      <div className="animate-fade-in-up pb-6 border-b">
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload bank statements and categorize transactions.</p>
      </div>

      <div className="grid gap-6 animate-fade-in">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Upload Bank Statement</CardTitle>
            <CardDescription>Import transactions directly from your bank statement CSV.</CardDescription>
          </CardHeader>
          <CardContent>
            <BankStatementUpload />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
            <CardDescription>View and categorize your imported transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionList />
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

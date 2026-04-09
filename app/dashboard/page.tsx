import { Suspense } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FinancialSummary } from "@/components/dashboard/financial-summary"
import { RecentInvoicesTable } from "@/components/dashboard/recent-invoices-table"
import { TransactionSummary } from "@/components/dashboard/transaction-summary"
import { GSTSummaryChart } from "@/components/dashboard/gst-summary-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between pb-6 border-b">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financial Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Overview of your financial data and key metrics.</p>
          </div>
          <Button asChild size="sm">
            <Link href="/invoices/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6 animate-fade-in">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="gst">GST</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={<FinancialSummarySkeleton />}>
            <FinancialSummary />
          </Suspense>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Transaction Overview</CardTitle>
                <CardDescription>Income vs. Expenses over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-sm text-muted-foreground animate-pulse">Loading chart…</div>
                  </div>
                }>
                  <TransactionSummary />
                </Suspense>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
                <CardDescription>Your latest invoices and status</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                }>
                  <RecentInvoicesTable />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Invoice Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Navigate to the{" "}
                <Link href="/invoices" className="text-primary underline underline-offset-4">Invoices page</Link>
                {" "}for a complete view of all your invoices.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Transaction Analysis</CardTitle>
              <CardDescription>Detailed breakdown of your transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Navigate to the{" "}
                <Link href="/transactions" className="text-primary underline underline-offset-4">Transactions page</Link>
                {" "}for a complete view.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gst" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">GST Summary</CardTitle>
              <CardDescription>Monthly breakdown of your GST liability</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Suspense fallback={
                <div className="h-full flex items-center justify-center">
                  <div className="text-sm text-muted-foreground animate-pulse">Loading GST data…</div>
                </div>
              }>
                <GSTSummaryChart />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

function FinancialSummarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array(4).fill(0).map((_, i) => (
        <Skeleton key={i} className="h-[110px] w-full" />
      ))}
    </div>
  )
}

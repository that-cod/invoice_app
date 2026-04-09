"use client"

import { useState } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ReportChart } from "@/components/reports/report-chart"
import { ReportTable } from "@/components/reports/report-table"
import { Download, FileText, BarChart, Loader2 } from "lucide-react"
import { getInvoices } from "@/app/actions/invoice-actions"
import { getTransactions } from "@/app/actions/transaction-actions"
import { getGSTSummary } from "@/app/actions/dashboard-actions"
import { useToast } from "@/components/ui/use-toast"

// ── Date helpers ─────────────────────────────────────────────────────────────

function getDateBounds(
  dateRange: string,
  startDate: string,
  endDate: string
): { start: string; end: string } {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  if (dateRange === "today") {
    return { start: fmt(now), end: fmt(now) }
  }
  if (dateRange === "week") {
    const start = new Date(now)
    start.setDate(now.getDate() - now.getDay())
    return { start: fmt(start), end: fmt(now) }
  }
  if (dateRange === "month") {
    return { start: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, end: fmt(now) }
  }
  if (dateRange === "quarter") {
    const q = Math.floor(now.getMonth() / 3)
    return { start: `${now.getFullYear()}-${pad(q * 3 + 1)}-01`, end: fmt(now) }
  }
  if (dateRange === "year") {
    return { start: `${now.getFullYear()}-01-01`, end: fmt(now) }
  }
  // custom
  return { start: startDate || fmt(now), end: endDate || fmt(now) }
}

function periodLabel(dateStr: string, groupBy: string): string {
  const d = new Date(dateStr)
  if (groupBy === "day") return dateStr
  if (groupBy === "week") {
    const week = Math.ceil(d.getDate() / 7)
    return `W${week} ${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`
  }
  if (groupBy === "month" || groupBy === "quarter" || groupBy === "category" || groupBy === "client") {
    return d.toLocaleString("default", { month: "short", year: "numeric" })
  }
  return String(d.getFullYear())
}

function groupAmounts(
  rows: { date: string; amount: number; label?: string }[],
  groupBy: string
): { name: string; value: number }[] {
  const map = new Map<string, number>()
  for (const row of rows) {
    const key = row.label ?? periodLabel(row.date, groupBy)
    map.set(key, (map.get(key) ?? 0) + Number(row.amount))
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { toast } = useToast()
  const [reportType, setReportType] = useState("sales")
  const [dateRange, setDateRange] = useState("month")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [groupBy, setGroupBy] = useState("month")
  const [viewType, setViewType] = useState("chart")
  const [isLoading, setIsLoading] = useState(false)
  const [chartData, setChartData] = useState<{ name: string; value: number }[] | undefined>(undefined)
  const [tableData, setTableData] = useState<any[] | undefined>(undefined)

  const handleGenerate = async () => {
    setIsLoading(true)
    try {
      const { start, end } = getDateBounds(dateRange, startDate, endDate)

      if (reportType === "sales" || reportType === "profit" || reportType === "clients") {
        const { data: invoices } = await getInvoices()
        const filtered = (invoices ?? []).filter((inv: any) => {
          const d = inv.issue_date?.slice(0, 10) ?? ""
          return d >= start && d <= end
        })

        if (reportType === "sales") {
          const paid = filtered.filter((inv: any) => inv.status === "paid")
          const grouped = groupAmounts(
            paid.map((inv: any) => ({ date: inv.issue_date?.slice(0, 10) ?? "", amount: inv.total })),
            groupBy
          )
          setChartData(grouped)
          // Build table rows with count + avg
          const map = new Map<string, { amount: number; count: number }>()
          for (const inv of paid) {
            const key = periodLabel(inv.issue_date?.slice(0, 10) ?? "", groupBy)
            const existing = map.get(key) ?? { amount: 0, count: 0 }
            map.set(key, { amount: existing.amount + Number(inv.total), count: existing.count + 1 })
          }
          const rows = Array.from(map.entries())
            .map(([period, { amount, count }]) => ({ period, amount, count, avgValue: count ? Math.round(amount / count) : 0 }))
            .sort((a, b) => a.period.localeCompare(b.period))
          setTableData(rows)
        }

        if (reportType === "clients") {
          const clientMap = new Map<string, number>()
          for (const inv of filtered) {
            const name = inv.clients?.name ?? "Unknown"
            clientMap.set(name, (clientMap.get(name) ?? 0) + Number(inv.total))
          }
          const grouped = Array.from(clientMap.entries()).map(([name, value]) => ({ name, value }))
          setChartData(grouped)
          setTableData(grouped.map(({ name, value }) => ({ period: name, amount: value })))
        }

        if (reportType === "profit") {
          const { data: txns } = await getTransactions()
          const filteredTxns = (txns ?? []).filter((t: any) => {
            const d = t.date?.slice(0, 10) ?? ""
            return d >= start && d <= end && t.type === "debit"
          })
          const revenueByPeriod = groupAmounts(
            filtered.filter((inv: any) => inv.status === "paid").map((inv: any) => ({ date: inv.issue_date?.slice(0, 10) ?? "", amount: inv.total })),
            groupBy
          )
          const expByPeriod = groupAmounts(
            filteredTxns.map((t: any) => ({ date: t.date?.slice(0, 10) ?? "", amount: t.amount })),
            groupBy
          )
          const periods = new Set([...revenueByPeriod.map((r) => r.name), ...expByPeriod.map((e) => e.name)])
          const revMap = new Map(revenueByPeriod.map((r) => [r.name, r.value]))
          const expMap = new Map(expByPeriod.map((e) => [e.name, e.value]))
          const profit = Array.from(periods)
            .sort()
            .map((name) => ({ name, value: (revMap.get(name) ?? 0) - (expMap.get(name) ?? 0) }))
          setChartData(profit)
          setTableData(profit.map(({ name, value }) => ({ period: name, amount: value })))
        }
      }

      if (reportType === "expenses") {
        const { data: txns } = await getTransactions()
        const filtered = (txns ?? []).filter((t: any) => {
          const d = t.date?.slice(0, 10) ?? ""
          return d >= start && d <= end && t.type === "debit"
        })
        const grouped = groupAmounts(
          filtered.map((t: any) => ({ date: t.date?.slice(0, 10) ?? "", amount: t.amount })),
          groupBy
        )
        setChartData(grouped)
        setTableData(filtered.map((t: any) => ({
          period: t.date?.slice(0, 10) ?? "",
          amount: Number(t.amount),
          category: t.category ?? "Uncategorized",
          vendor: t.description ?? "-",
        })))
      }

      if (reportType === "tax") {
        const { data: gst } = await getGSTSummary()
        const rows = (gst ?? []).filter((g: any) => {
          const d = `${g.year}-${String(g.month).padStart(2, "0")}-01`
          return d >= start && d <= end
        })
        const chartRows = rows.map((g: any) => ({
          name: new Date(g.year, g.month - 1).toLocaleString("default", { month: "short", year: "numeric" }),
          value: Number(g.cgst_collected ?? 0) + Number(g.sgst_collected ?? 0) + Number(g.igst_collected ?? 0),
        }))
        setChartData(chartRows)
        setTableData(rows.map((g: any) => ({
          period: new Date(g.year, g.month - 1).toLocaleString("default", { month: "short", year: "numeric" }),
          cgst: Number(g.cgst_collected ?? 0),
          sgst: Number(g.sgst_collected ?? 0),
          igst: Number(g.igst_collected ?? 0),
          total: Number(g.cgst_collected ?? 0) + Number(g.sgst_collected ?? 0) + Number(g.igst_collected ?? 0),
        })))
      }

      if (reportType === "products") {
        const { data: invoices } = await getInvoices()
        const filtered = (invoices ?? []).filter((inv: any) => {
          const d = inv.issue_date?.slice(0, 10) ?? ""
          return d >= start && d <= end
        })
        const grouped = groupAmounts(
          filtered.map((inv: any) => ({ date: inv.issue_date?.slice(0, 10) ?? "", amount: inv.total })),
          groupBy
        )
        setChartData(grouped)
        setTableData(grouped.map(({ name, value }) => ({ period: name, amount: value })))
      }
    } catch (err) {
      console.error("Error generating report:", err)
      toast({ title: "Error", description: "Failed to generate report.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardShell>
      <div className="animate-fade-in-up flex items-center justify-between pb-6 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and view custom reports for your business.</p>
        </div>
        <Button size="sm" onClick={() => {
          if (!tableData || tableData.length === 0) {
            toast({ title: "No data", description: "Generate a report first before exporting.", variant: "destructive" })
            return
          }
          const headers = Object.keys(tableData[0])
          const rows = tableData.map((row: Record<string, unknown>) => headers.map((h) => String(row[h] ?? "")).join(","))
          const csv = [headers.join(","), ...rows].join("\n")
          const blob = new Blob([csv], { type: "text/csv" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${reportType}-report.csv`
          a.click()
          URL.revokeObjectURL(url)
        }}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-6 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
            <CardDescription>Customize your report by selecting parameters.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="expenses">Expenses Report</SelectItem>
                    <SelectItem value="profit">Profit & Loss</SelectItem>
                    <SelectItem value="tax">Tax Report</SelectItem>
                    <SelectItem value="clients">Client Report</SelectItem>
                    <SelectItem value="products">Product Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-range">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger id="date-range">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-by">Group By</Label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger id="group-by">
                    <SelectValue placeholder="Select grouping" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateRange === "custom" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                {reportType === "sales" && "Sales Report"}
                {reportType === "expenses" && "Expenses Report"}
                {reportType === "profit" && "Profit & Loss Report"}
                {reportType === "tax" && "Tax Report"}
                {reportType === "clients" && "Client Report"}
                {reportType === "products" && "Product Performance Report"}
              </CardTitle>
              <CardDescription>
                {dateRange === "today" && "Today"}
                {dateRange === "week" && "This Week"}
                {dateRange === "month" && "This Month"}
                {dateRange === "quarter" && "This Quarter"}
                {dateRange === "year" && "This Year"}
                {dateRange === "custom" && `${startDate} to ${endDate}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewType === "chart" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("chart")}
              >
                <BarChart className="h-4 w-4 mr-1" />
                Chart
              </Button>
              <Button
                variant={viewType === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("table")}
              >
                <FileText className="h-4 w-4 mr-1" />
                Table
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {chartData === undefined ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Select parameters above and click <strong>Generate Report</strong> to see data.</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-muted-foreground">No data found for the selected period.</p>
              </div>
            ) : viewType === "chart" ? (
              <ReportChart reportType={reportType} groupBy={groupBy} data={chartData} />
            ) : (
              <ReportTable reportType={reportType} groupBy={groupBy} data={tableData} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

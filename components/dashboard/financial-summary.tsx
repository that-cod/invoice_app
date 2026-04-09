"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ArrowDownRight, DollarSign, Receipt, CreditCard, TrendingUp } from "lucide-react"
import { getFinancialSummary } from "@/app/actions/dashboard-actions"
import { cn } from "@/lib/utils"

const STAT_CARDS = [
  {
    key: "totalRevenue" as const,
    label: "Total Revenue",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
    trend: { icon: ArrowUpRight, label: "From paid invoices", color: "text-emerald-600" },
  },
  {
    key: "outstandingInvoices" as const,
    label: "Outstanding",
    icon: Receipt,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    trend: { icon: ArrowDownRight, label: "Pending & overdue", color: "text-amber-600" },
  },
  {
    key: "bankBalance" as const,
    label: "Bank Balance",
    icon: CreditCard,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
    trend: null,
  },
  {
    key: "totalExpenses" as const,
    label: "Total Expenses",
    icon: TrendingUp,
    color: "text-rose-600",
    bg: "bg-rose-500/10",
    trend: null,
  },
]

type SummaryData = {
  totalRevenue: number
  outstandingInvoices: number
  bankBalance: number
  totalExpenses: number
}

export function FinancialSummary() {
  const [data, setData] = useState<SummaryData>({ totalRevenue: 0, outstandingInvoices: 0, bankBalance: 0, totalExpenses: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getFinancialSummary()
      if (result.data) setData(result.data)
      setIsLoading(false)
    }
    load()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in-stagger">
      {STAT_CARDS.map((card) => {
        const Icon = card.icon
        const TrendIcon = card.trend?.icon
        return (
          <Card key={card.key} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", card.bg)}>
                <Icon className={cn("h-4 w-4", card.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                ₹{data[card.key].toLocaleString("en-IN")}
              </div>
              {card.trend && TrendIcon && (
                <p className={cn("text-xs mt-1 flex items-center gap-1", card.trend.color)}>
                  <TrendIcon className="h-3 w-3" />
                  {card.trend.label}
                </p>
              )}
              {!card.trend && (
                <p className="text-xs mt-1 text-muted-foreground">Current balance</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

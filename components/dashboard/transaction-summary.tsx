"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getTransactionSummary } from "@/app/actions/dashboard-actions"

export function TransactionSummary() {
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getTransactionSummary()
      if (result.data) {
        const monthlyData = result.data.reduce((acc: Record<string, any>, transaction: any) => {
          const date = new Date(transaction.date)
          const month = date.toLocaleString("default", { month: "short" })
          const year = date.getFullYear()
          const key = `${month} ${year}`

          if (!acc[key]) {
            acc[key] = { name: month, income: 0, expenses: 0 }
          }

          if (transaction.type === "credit") {
            acc[key].income += transaction.amount
          } else {
            acc[key].expenses += transaction.amount
          }

          return acc
        }, {})
        setChartData(Object.values(monthlyData))
      }
      setIsLoading(false)
    }
    load()
  }, [])

  if (isLoading) {
    return <div className="h-[350px] flex items-center justify-center text-muted-foreground">Loading...</div>
  }

  if (chartData.length === 0) {
    return <div className="h-[350px] flex items-center justify-center text-muted-foreground">No transaction data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
        <Tooltip
          formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#10b981" />
        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  )
}

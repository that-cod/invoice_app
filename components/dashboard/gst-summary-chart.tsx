"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getGSTSummary } from "@/app/actions/dashboard-actions"

export function GSTSummaryChart() {
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getGSTSummary()
      if (result.data && result.data.length > 0) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        setChartData(
          result.data.map((entry: any) => ({
            name: monthNames[entry.month - 1],
            collected: entry.cgst_collected + entry.sgst_collected + entry.igst_collected,
            paid: entry.cgst_paid + entry.sgst_paid + entry.igst_paid,
            balance: entry.net_cgst + entry.net_sgst + entry.net_igst,
          }))
        )
      }
      setIsLoading(false)
    }
    load()
  }, [])

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">Loading...</div>
  }

  if (chartData.length === 0) {
    return <div className="h-full flex items-center justify-center">No GST data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
        <Tooltip
          formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Bar dataKey="collected" name="GST Collected" fill="#8884d8" />
        <Bar dataKey="paid" name="GST Paid" fill="#82ca9d" />
        <Bar dataKey="balance" name="ITC Balance" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  )
}

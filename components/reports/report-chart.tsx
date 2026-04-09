"use client"

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"

// Sample data for different report types
const reportData = {
  sales: [
    { name: "Jan", value: 45000 },
    { name: "Feb", value: 52000 },
    { name: "Mar", value: 48000 },
    { name: "Apr", value: 61000 },
    { name: "May", value: 55000 },
    { name: "Jun", value: 67000 },
    { name: "Jul", value: 72000 },
    { name: "Aug", value: 59000 },
    { name: "Sep", value: 63000 },
    { name: "Oct", value: 70000 },
    { name: "Nov", value: 78000 },
    { name: "Dec", value: 82000 },
  ],
  expenses: [
    { name: "Jan", value: 32000 },
    { name: "Feb", value: 28000 },
    { name: "Mar", value: 35000 },
    { name: "Apr", value: 30000 },
    { name: "May", value: 33000 },
    { name: "Jun", value: 38000 },
    { name: "Jul", value: 42000 },
    { name: "Aug", value: 36000 },
    { name: "Sep", value: 39000 },
    { name: "Oct", value: 41000 },
    { name: "Nov", value: 45000 },
    { name: "Dec", value: 48000 },
  ],
  profit: [
    { name: "Jan", value: 13000 },
    { name: "Feb", value: 24000 },
    { name: "Mar", value: 13000 },
    { name: "Apr", value: 31000 },
    { name: "May", value: 22000 },
    { name: "Jun", value: 29000 },
    { name: "Jul", value: 30000 },
    { name: "Aug", value: 23000 },
    { name: "Sep", value: 24000 },
    { name: "Oct", value: 29000 },
    { name: "Nov", value: 33000 },
    { name: "Dec", value: 34000 },
  ],
  tax: [
    { name: "Jan", value: 8100 },
    { name: "Feb", value: 9360 },
    { name: "Mar", value: 8640 },
    { name: "Apr", value: 10980 },
    { name: "May", value: 9900 },
    { name: "Jun", value: 12060 },
    { name: "Jul", value: 12960 },
    { name: "Aug", value: 10620 },
    { name: "Sep", value: 11340 },
    { name: "Oct", value: 12600 },
    { name: "Nov", value: 14040 },
    { name: "Dec", value: 14760 },
  ],
}

export function ReportChart({ reportType, groupBy, data: externalData }: { reportType: string; groupBy: string; data?: { name: string; value: number }[] }) {
  // Use provided data or fall back to sample data
  const data = externalData ?? (reportData[reportType as keyof typeof reportData] || reportData.sales)

  // Determine chart type based on report type
  const isLineChart = reportType === "profit" || reportType === "tax"

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        {isLineChart ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
            <Tooltip
              formatter={(value) => [
                `₹${value.toLocaleString("en-IN")}`,
                reportType.charAt(0).toUpperCase() + reportType.slice(1),
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name={reportType.charAt(0).toUpperCase() + reportType.slice(1)}
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
            <Tooltip
              formatter={(value) => [
                `₹${value.toLocaleString("en-IN")}`,
                reportType.charAt(0).toUpperCase() + reportType.slice(1),
              ]}
            />
            <Legend />
            <Bar dataKey="value" name={reportType.charAt(0).toUpperCase() + reportType.slice(1)} fill="#8884d8" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Sample data for different report types
const reportData = {
  sales: [
    { period: "Jan", amount: 45000, count: 15, avgValue: 3000 },
    { period: "Feb", amount: 52000, count: 18, avgValue: 2889 },
    { period: "Mar", amount: 48000, count: 16, avgValue: 3000 },
    { period: "Apr", amount: 61000, count: 20, avgValue: 3050 },
    { period: "May", amount: 55000, count: 19, avgValue: 2895 },
    { period: "Jun", amount: 67000, count: 22, avgValue: 3045 },
    { period: "Jul", amount: 72000, count: 24, avgValue: 3000 },
    { period: "Aug", amount: 59000, count: 21, avgValue: 2810 },
    { period: "Sep", amount: 63000, count: 20, avgValue: 3150 },
    { period: "Oct", amount: 70000, count: 23, avgValue: 3043 },
    { period: "Nov", amount: 78000, count: 25, avgValue: 3120 },
    { period: "Dec", amount: 82000, count: 27, avgValue: 3037 },
  ],
  expenses: [
    { period: "Jan", amount: 32000, category: "Salaries", vendor: "Multiple" },
    { period: "Feb", amount: 28000, category: "Rent", vendor: "Property Management" },
    { period: "Mar", amount: 35000, category: "Supplies", vendor: "Office Depot" },
    { period: "Apr", amount: 30000, category: "Utilities", vendor: "Multiple" },
    { period: "May", amount: 33000, category: "Marketing", vendor: "Digital Agency" },
    { period: "Jun", amount: 38000, category: "Equipment", vendor: "Tech Supplier" },
    { period: "Jul", amount: 42000, category: "Salaries", vendor: "Multiple" },
    { period: "Aug", amount: 36000, category: "Software", vendor: "Various" },
    { period: "Sep", amount: 39000, category: "Travel", vendor: "Multiple" },
    { period: "Oct", amount: 41000, category: "Consulting", vendor: "Business Services" },
    { period: "Nov", amount: 45000, category: "Training", vendor: "Education Center" },
    { period: "Dec", amount: 48000, category: "Bonuses", vendor: "Multiple" },
  ],
  tax: [
    { period: "Jan", cgst: 4050, sgst: 4050, igst: 0, total: 8100 },
    { period: "Feb", cgst: 4680, sgst: 4680, igst: 0, total: 9360 },
    { period: "Mar", cgst: 4320, sgst: 4320, igst: 0, total: 8640 },
    { period: "Apr", cgst: 5490, sgst: 5490, igst: 0, total: 10980 },
    { period: "May", cgst: 4950, sgst: 4950, igst: 0, total: 9900 },
    { period: "Jun", cgst: 6030, sgst: 6030, igst: 0, total: 12060 },
    { period: "Jul", cgst: 6480, sgst: 6480, igst: 0, total: 12960 },
    { period: "Aug", cgst: 5310, sgst: 5310, igst: 0, total: 10620 },
    { period: "Sep", cgst: 5670, sgst: 5670, igst: 0, total: 11340 },
    { period: "Oct", cgst: 6300, sgst: 6300, igst: 0, total: 12600 },
    { period: "Nov", cgst: 7020, sgst: 7020, igst: 0, total: 14040 },
    { period: "Dec", cgst: 7380, sgst: 7380, igst: 0, total: 14760 },
  ],
}

export function ReportTable({ reportType, groupBy, data: externalData }: { reportType: string; groupBy: string; data?: any[] }) {
  // Use provided data or fall back to sample data
  const data = externalData ?? (reportData[reportType as keyof typeof reportData] || reportData.sales)

  // Render different table structures based on report type
  if (reportType === "sales") {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Invoices</TableHead>
            <TableHead className="text-right">Avg. Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.period}</TableCell>
              <TableCell className="text-right">₹{row.amount.toLocaleString("en-IN")}</TableCell>
              <TableCell className="text-right">{row.count}</TableCell>
              <TableCell className="text-right">₹{row.avgValue.toLocaleString("en-IN")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  if (reportType === "expenses") {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.period}</TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>{row.vendor}</TableCell>
              <TableCell className="text-right">₹{row.amount.toLocaleString("en-IN")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  if (reportType === "tax") {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">CGST</TableHead>
            <TableHead className="text-right">SGST</TableHead>
            <TableHead className="text-right">IGST</TableHead>
            <TableHead className="text-right">Total Tax</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.period}</TableCell>
              <TableCell className="text-right">₹{row.cgst.toLocaleString("en-IN")}</TableCell>
              <TableCell className="text-right">₹{row.sgst.toLocaleString("en-IN")}</TableCell>
              <TableCell className="text-right">₹{row.igst.toLocaleString("en-IN")}</TableCell>
              <TableCell className="text-right font-medium">₹{row.total.toLocaleString("en-IN")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  // Default table for other report types
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Period</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.period}</TableCell>
            <TableCell className="text-right">₹{row.amount.toLocaleString("en-IN")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

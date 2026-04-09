"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getITCSummary } from "@/app/actions/dashboard-actions"

export function ITCSummary() {
  const [gstData, setGstData] = useState({
    cgst_collected: 0, sgst_collected: 0, igst_collected: 0,
    cgst_paid: 0, sgst_paid: 0, igst_paid: 0,
    net_cgst: 0, net_sgst: 0, net_igst: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getITCSummary()
      if (result.data) setGstData(result.data)
      setIsLoading(false)
    }
    load()
  }, [])

  if (isLoading) {
    return <div>Loading GST summary...</div>
  }

  const totalGstCollected = gstData.cgst_collected + gstData.sgst_collected + gstData.igst_collected
  const totalGstPaid = gstData.cgst_paid + gstData.sgst_paid + gstData.igst_paid
  const netItcBalance = totalGstPaid - totalGstCollected

  return (
    <Card>
      <CardHeader>
        <CardTitle>Input Tax Credit Summary</CardTitle>
        <CardDescription>Available ITC after adjusting GST to be paid on purchases</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total GST Collected (Output Tax)</p>
              <p className="text-2xl font-bold">
                ₹{totalGstCollected.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Total GST Paid (Input Tax)</p>
              <p className="text-2xl font-bold">
                ₹{totalGstPaid.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Net ITC Balance</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{netItcBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div>CGST</div>
              <div className="font-medium">
                ₹{gstData.net_cgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </div>
            </div>
            <Progress value={50} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div>SGST</div>
              <div className="font-medium">
                ₹{gstData.net_sgst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </div>
            </div>
            <Progress value={50} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div>IGST</div>
              <div className="font-medium">
                ₹{gstData.net_igst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </div>
            </div>
            <Progress value={gstData.net_igst > 0 ? 30 : 0} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

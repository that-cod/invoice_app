"use client"

import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export function SharePageActions() {
  const handleDownload = async () => {
    const element = document.getElementById('invoice-preview-container')
    if (!element) return

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save('invoice.pdf')
  }

  const handlePrint = () => {
    const content = document.getElementById('invoice-preview-container')
    if (!content) return
    const printWindow = window.open('', '_blank')
    printWindow?.document.write(`
      <html><head><title>Invoice</title>
      <style>body{margin:0;padding:0;} @media print{body{margin:0;}}</style>
      </head><body>${content.innerHTML}</body></html>
    `)
    printWindow?.document.close()
    printWindow?.focus()
    printWindow?.print()
    printWindow?.close()
  }

  return (
    <div className="flex gap-2 mb-4 justify-end">
      <Button variant="outline" onClick={handleDownload}>
        <Download className="mr-2 h-4 w-4" />
        Download PDF
      </Button>
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
    </div>
  )
}

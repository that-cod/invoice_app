"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, Upload } from "lucide-react"
import Link from "next/link"
import { uploadBankStatement } from "@/app/actions/transaction-actions"
import { toast } from "@/components/ui/use-toast"
import * as XLSX from "xlsx"

export function BankStatementUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadStatus("idle")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadStatus("idle")

    try {
      // Parse the file
      const data = await parseFile(file)

      if (!data || data.length === 0) {
        toast({
          title: "Error",
          description: "No valid data found in the file. Please check the format.",
          variant: "destructive",
        })
        setUploadStatus("error")
        return
      }

      // Format the data for our database
      const transactions = data.map((row) => ({
        date: formatDate(row.Date || row.date || row.TransactionDate || ""),
        description: row.Description || row.description || row.Narration || row.Particulars || "",
        amount: Number.parseFloat(row.Amount || row.amount || row.Debit || row.Credit || "0"),
        type: determineTransactionType(row),
        category: "Uncategorized",
        is_categorized: false,
      }))

      // Upload to database
      const { success, error } = await uploadBankStatement(transactions)

      if (error) {
        console.error("Error uploading transactions:", error)
        toast({
          title: "Error",
          description: "Failed to upload bank statement. Please try again.",
          variant: "destructive",
        })
        setUploadStatus("error")
      } else {
        toast({
          title: "Success",
          description: `${transactions.length} transactions imported successfully.`,
        })
        setUploadStatus("success")
      }
    } catch (error) {
      console.error("Error processing file:", error)
      toast({
        title: "Error",
        description: "Failed to process the file. Please check the format.",
        variant: "destructive",
      })
      setUploadStatus("error")
    } finally {
      setIsUploading(false)
    }
  }

  // Helper function to parse CSV/Excel files
  const parseFile = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: "binary" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const json = XLSX.utils.sheet_to_json(worksheet)
          resolve(json)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = (error) => reject(error)
      reader.readAsBinaryString(file)
    })
  }

  // Helper function to format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return new Date().toISOString().split("T")[0]

    // Try to parse the date
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0]
    }

    // If parsing fails, return today's date
    return new Date().toISOString().split("T")[0]
  }

  // Helper function to determine transaction type
  const determineTransactionType = (row: any) => {
    // Check if we have explicit debit/credit columns
    if (row.Debit && Number.parseFloat(row.Debit) > 0) return "debit"
    if (row.Credit && Number.parseFloat(row.Credit) > 0) return "credit"

    // Check if we have a type column
    if (row.Type || row.type) {
      const type = (row.Type || row.type).toLowerCase()
      if (type.includes("debit") || type.includes("dr") || type.includes("withdrawal")) return "debit"
      if (type.includes("credit") || type.includes("cr") || type.includes("deposit")) return "credit"
    }

    // Check amount sign
    const amount = Number.parseFloat(row.Amount || row.amount || "0")
    if (amount < 0) return "debit"
    return "credit"
  }

  return (
    <div className="space-y-6">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="bank-statement">Bank Statement</Label>
        <Input id="bank-statement" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
        <p className="text-sm text-muted-foreground">Upload CSV or Excel files only</p>
      </div>

      {uploadStatus === "success" && (
        <Alert variant="success">
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Your bank statement has been uploaded and processed successfully.</AlertDescription>
        </Alert>
      )}

      {uploadStatus === "error" && (
        <Alert variant="destructive">
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>
            There was a problem processing your bank statement. Please check the format and try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={handleUpload} disabled={!file || isUploading}>
          {isUploading ? (
            <>Uploading...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Statement
            </>
          )}
        </Button>

        <Button variant="outline" asChild>
          <Link href="/templates/bank-statement-template.xlsx" download>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Link>
        </Button>
      </div>
    </div>
  )
}

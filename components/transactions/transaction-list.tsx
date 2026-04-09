"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { TransactionCategorizeDialog } from "@/components/transactions/transaction-categorize-dialog"
import { getTransactions, categorizeTransactions } from "@/app/actions/transaction-actions"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export function TransactionList() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [isCategorizeOpen, setIsCategorizeOpen] = useState(false)
  const [patternTransactions, setPatternTransactions] = useState<any[]>([])

  useEffect(() => {
    async function loadTransactions() {
      setIsLoading(true)
      const { data, error } = await getTransactions()
      if (data) {
        setTransactions(data)
      }
      setIsLoading(false)
    }

    loadTransactions()
  }, [])

  const handleSelectTransaction = (id: string) => {
    setSelectedTransactions((prev) => (prev.includes(id) ? prev.filter((txId) => txId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(transactions.map((tx) => tx.id))
    }
  }

  const handleCategorize = () => {
    // Find the first selected transaction
    const firstSelected = transactions.find((tx) => selectedTransactions.includes(tx.id))

    if (firstSelected) {
      // Find all transactions with similar description
      const pattern = firstSelected.description
      const similarTransactions = transactions.filter((tx) => tx.description.includes(pattern))

      setPatternTransactions(similarTransactions)
      setIsCategorizeOpen(true)
    }
  }

  const handleSaveCategorization = async (categoryData: any) => {
    try {
      const { success, error } = await categorizeTransactions(selectedTransactions, categoryData)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to categorize transactions. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Transactions categorized successfully.",
        })

        // Update local state
        setTransactions(
          transactions.map((tx) => {
            if (selectedTransactions.includes(tx.id)) {
              return {
                ...tx,
                category: categoryData.accountName || "Uncategorized",
                is_categorized: true,
              }
            }
            return tx
          }),
        )

        // Clear selection
        setSelectedTransactions([])
      }
    } catch (error) {
      console.error("Error categorizing transactions:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedTransactions.length > 0 && (
        <div className="flex items-center gap-2">
          <Button onClick={handleCategorize}>Categorize Selected ({selectedTransactions.length})</Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No transactions found. Upload a bank statement to get started.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTransactions.includes(transaction.id)}
                      onCheckedChange={() => handleSelectTransaction(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className={transaction.type === "credit" ? "text-green-600" : "text-red-600"}>
                    {transaction.type === "credit" ? "+" : "-"}₹{Math.abs(transaction.amount).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    {transaction.category === "Uncategorized" || !transaction.is_categorized ? (
                      <Badge variant="outline">Uncategorized</Badge>
                    ) : (
                      <Badge>{transaction.category}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TransactionCategorizeDialog
        open={isCategorizeOpen}
        onOpenChange={setIsCategorizeOpen}
        transactions={patternTransactions}
        onSave={handleSaveCategorization}
      />
    </div>
  )
}

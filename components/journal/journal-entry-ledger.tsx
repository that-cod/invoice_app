"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2, CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getAccounts } from "@/app/actions/account-actions"

export function JournalEntryLedger({ entries, setEntries }) {
  const [accounts, setAccounts] = useState([])

  // Load accounts
  useEffect(() => {
    async function loadAccounts() {
      try {
        const result = await getAccounts()
        if (result.data) {
          setAccounts(result.data)
        }
      } catch (error) {
        console.error("Error in accounts fetch:", error)
      }
    }

    loadAccounts()
  }, [])

  const handleUpdateEntry = (entryIndex, field, value) => {
    const updatedEntries = [...entries]
    updatedEntries[entryIndex][field] = value
    setEntries(updatedEntries)
  }

  const handleUpdateItem = (entryIndex, itemIndex, field, value) => {
    const updatedEntries = [...entries]

    // If updating debit, clear credit and vice versa
    if (field === "debit" && value > 0) {
      updatedEntries[entryIndex].items[itemIndex].credit = 0
    } else if (field === "credit" && value > 0) {
      updatedEntries[entryIndex].items[itemIndex].debit = 0
    }

    updatedEntries[entryIndex].items[itemIndex][field] = value
    setEntries(updatedEntries)
  }

  const handleAddItem = (entryIndex) => {
    const updatedEntries = [...entries]
    updatedEntries[entryIndex].items.push({
      id: Date.now(),
      account: "",
      debit: 0,
      credit: 0,
    })
    setEntries(updatedEntries)
  }

  const handleRemoveItem = (entryIndex, itemIndex) => {
    const updatedEntries = [...entries]
    // Ensure we keep at least two items (one for debit, one for credit)
    if (updatedEntries[entryIndex].items.length > 2) {
      updatedEntries[entryIndex].items.splice(itemIndex, 1)
      setEntries(updatedEntries)
    }
  }

  const handleRemoveEntry = (entryIndex) => {
    const updatedEntries = [...entries]
    updatedEntries.splice(entryIndex, 1)
    setEntries(updatedEntries)
  }

  return (
    <div className="space-y-8">
      {entries.map((entry, entryIndex) => {
        // Calculate totals
        const totalDebit = entry.items.reduce((sum, item) => sum + (Number(item.debit) || 0), 0)
        const totalCredit = entry.items.reduce((sum, item) => sum + (Number(item.credit) || 0), 0)
        const isBalanced = totalDebit === totalCredit && totalDebit > 0

        return (
          <div key={entry.id} className="rounded-lg border overflow-hidden bg-card">
            {/* Entry header */}
            <div className="bg-muted p-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[140px] justify-start text-left font-normal",
                          !entry.date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {entry.date ? format(new Date(entry.date), "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={entry.date ? new Date(entry.date) : undefined}
                        onSelect={(date) =>
                          handleUpdateEntry(entryIndex, "date", date ? format(date, "yyyy-MM-dd") : "")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1 max-w-md">
                  <label className="text-sm font-medium">Narration</label>
                  <Textarea
                    value={entry.narration}
                    onChange={(e) => handleUpdateEntry(entryIndex, "narration", e.target.value)}
                    placeholder="Enter narration..."
                    className="resize-none h-10"
                  />
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleRemoveEntry(entryIndex)}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove entry</span>
              </Button>
            </div>

            {/* Ledger table */}
            <div className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-y">
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground w-[50%]">Account</th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground w-[20%]">Debit (₹)</th>
                      <th className="px-4 py-2 text-right font-medium text-muted-foreground w-[20%]">Credit (₹)</th>
                      <th className="px-4 py-2 text-center font-medium text-muted-foreground w-[10%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {entry.items.map((item, itemIndex) => (
                      <tr key={item.id} className="hover:bg-muted/20">
                        <td className="px-4 py-2">
                          <Select
                            value={item.account}
                            onValueChange={(value) => handleUpdateItem(entryIndex, itemIndex, "account", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="max-h-[300px] overflow-y-auto">
                                {accounts.length > 0 ? (
                                  <>
                                    <div className="px-2 py-1.5 text-sm font-semibold">Assets</div>
                                    {accounts
                                      .filter((account) => account.type === "Asset")
                                      .map((account) => (
                                        <SelectItem key={account.id} value={account.name}>
                                          {account.name}
                                        </SelectItem>
                                      ))}
                                    <div className="px-2 py-1.5 text-sm font-semibold">Liabilities</div>
                                    {accounts
                                      .filter((account) => account.type === "Liability")
                                      .map((account) => (
                                        <SelectItem key={account.id} value={account.name}>
                                          {account.name}
                                        </SelectItem>
                                      ))}
                                    <div className="px-2 py-1.5 text-sm font-semibold">Equity</div>
                                    {accounts
                                      .filter((account) => account.type === "Equity")
                                      .map((account) => (
                                        <SelectItem key={account.id} value={account.name}>
                                          {account.name}
                                        </SelectItem>
                                      ))}
                                    <div className="px-2 py-1.5 text-sm font-semibold">Revenue</div>
                                    {accounts
                                      .filter((account) => account.type === "Revenue" || account.type === "Income")
                                      .map((account) => (
                                        <SelectItem key={account.id} value={account.name}>
                                          {account.name}
                                        </SelectItem>
                                      ))}
                                    <div className="px-2 py-1.5 text-sm font-semibold">Expenses</div>
                                    {accounts
                                      .filter((account) => account.type === "Expense")
                                      .map((account) => (
                                        <SelectItem key={account.id} value={account.name}>
                                          {account.name}
                                        </SelectItem>
                                      ))}
                                  </>
                                ) : (
                                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                                    No accounts found
                                  </div>
                                )}
                              </div>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.debit || ""}
                            onChange={(e) =>
                              handleUpdateItem(entryIndex, itemIndex, "debit", Number.parseFloat(e.target.value) || 0)
                            }
                            className="text-right"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.credit || ""}
                            onChange={(e) =>
                              handleUpdateItem(entryIndex, itemIndex, "credit", Number.parseFloat(e.target.value) || 0)
                            }
                            className="text-right"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(entryIndex, itemIndex)}
                            disabled={entry.items.length <= 2}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove item</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr className="bg-muted/30 font-medium">
                      <td className="px-4 py-2 text-right">Total</td>
                      <td className="px-4 py-2 text-right">
                        ₹{totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-right">
                        ₹{totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Add item button */}
              <div className="p-4 flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => handleAddItem(entryIndex)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Line
                </Button>
                <div>
                  {!isBalanced && totalDebit > 0 && totalCredit > 0 ? (
                    <div className="text-sm text-destructive">
                      Difference: ₹
                      {Math.abs(totalDebit - totalCredit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  ) : isBalanced ? (
                    <div className="text-sm text-green-600">Entry balanced</div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

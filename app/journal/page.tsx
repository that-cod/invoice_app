"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { JournalEntryLedger } from "@/components/journal/journal-entry-ledger"
import { FinancialStatements } from "@/components/journal/financial-statements"
import { Button } from "@/components/ui/button"
import { PlusCircle, Save, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { saveJournalEntries, getJournalEntries } from "@/app/actions/journal-actions"

type JournalItem = { id: number; account: string; debit: number; credit: number }
type JournalEntry = { id: number; date: string; narration: string; items: JournalItem[] }
type SavedEntry = { id: string; entry_date: string; narration: string; total_amount: number }

export default function JournalPage() {
  const { toast } = useToast()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [savedEntries, setSavedEntries] = useState<SavedEntry[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getJournalEntries().then(({ data }) => {
      if (data) setSavedEntries(data as SavedEntry[])
    })
  }, [])

  const handleAddEntry = () => {
    const now = Date.now()
    setEntries([
      ...entries,
      {
        id: now,
        date: new Date().toISOString().split("T")[0],
        narration: "",
        items: [
          { id: now + 1, account: "", debit: 0, credit: 0 },
          { id: now + 2, account: "", debit: 0, credit: 0 },
        ],
      },
    ])
  }

  const handleSaveEntries = async () => {
    let isValid = true
    let errorMessage = ""

    for (const entry of entries) {
      if (!entry.narration.trim()) {
        isValid = false
        errorMessage = "Please provide a narration for all entries."
        break
      }
      const hasDebit = entry.items.some((item) => item.debit > 0)
      const hasCredit = entry.items.some((item) => item.credit > 0)
      if (!hasDebit || !hasCredit) {
        isValid = false
        errorMessage = "Each entry must have at least one debit and one credit."
        break
      }
      const hasEmptyAccount = entry.items.some((item) => !item.account.trim())
      if (hasEmptyAccount) {
        isValid = false
        errorMessage = "Please select an account for all items."
        break
      }
      const totalDebit = entry.items.reduce((sum, item) => sum + (item.debit || 0), 0)
      const totalCredit = entry.items.reduce((sum, item) => sum + (item.credit || 0), 0)
      if (totalDebit !== totalCredit) {
        isValid = false
        errorMessage = "Total debits must equal total credits for each entry."
        break
      }
    }

    if (!isValid) {
      toast({ title: "Validation Error", description: errorMessage, variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const result = await saveJournalEntries(entries)
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" })
        return
      }
      toast({ title: "Entries saved", description: "Journal entries saved successfully." })
      setEntries([])
      // Refresh saved entries list
      const { data } = await getJournalEntries()
      if (data) setSavedEntries(data as SavedEntry[])
    } catch (error) {
      console.error("Error saving journal entries:", error)
      toast({ title: "Error", description: "Failed to save journal entries.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardShell>
      <div className="animate-fade-in-up flex items-start justify-between pb-6 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal Entries</h1>
          <p className="text-sm text-muted-foreground mt-1">Record financial transactions using double-entry accounting.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={handleAddEntry}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Entry
          </Button>
          {entries.length > 0 && (
            <Button size="sm" variant="outline" onClick={handleSaveEntries} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Saving…" : "Save Entries"}
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <a href="/journal/ledger">
              <FileText className="mr-2 h-4 w-4" />
              Ledger
            </a>
          </Button>
        </div>
      </div>

      <div className="space-y-6 animate-fade-in">
        {entries.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1">No journal entries yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first double-entry to get started.</p>
            <Button size="sm" onClick={handleAddEntry}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </div>
        ) : (
          <JournalEntryLedger entries={entries} setEntries={setEntries} />
        )}

        {savedEntries.length > 0 && (
          <div>
            <h3 className="text-base font-semibold mb-3">Recent Journal Entries</h3>
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                    <th className="px-4 py-3 text-left font-medium">Narration</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {savedEntries.slice(0, 5).map((entry) => (
                    <tr key={entry.id} className="border-t hover:bg-muted/30 transition-colors duration-fast">
                      <td className="px-4 py-3 text-muted-foreground">{new Date(entry.entry_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{entry.narration}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        ₹{Number(entry.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <FinancialStatements entries={entries} />
    </DashboardShell>
  )
}

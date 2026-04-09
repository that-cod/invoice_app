"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createAccount } from "@/app/actions/account-actions"

const ACCOUNT_TYPES = ["Asset", "Liability", "Income", "Expense", "Equity"]

const CATEGORIES_BY_TYPE: Record<string, string[]> = {
  Asset: ["Current Asset", "Fixed Asset", "Bank", "Cash"],
  Liability: ["Current Liability", "Long-term Liability"],
  Income: ["Revenue", "Other Income"],
  Expense: ["Direct Expense", "Indirect Expense", "Administrative"],
  Equity: ["Owner's Equity", "Retained Earnings"],
}

interface AccountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AccountFormDialog({ open, onOpenChange, onSuccess }: AccountFormDialogProps) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [category, setCategory] = useState("")
  const [balance, setBalance] = useState("0")

  const reset = () => {
    setName("")
    setType("")
    setCategory("")
    setBalance("0")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !type || !category) {
      toast({ title: "Validation Error", description: "Name, type, and category are required.", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const { error } = await createAccount({
        name: name.trim(),
        type,
        category,
        balance: parseFloat(balance) || 0,
      })

      if (error) {
        toast({ title: "Error", description: error, variant: "destructive" })
        return
      }

      toast({ title: "Account created", description: `${name} has been added to your chart of accounts.` })
      reset()
      onOpenChange(false)
      onSuccess()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="acc-name">Account Name</Label>
            <Input id="acc-name" placeholder="e.g. Office Supplies" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => { setType(v); setCategory("") }}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={!type}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {(CATEGORIES_BY_TYPE[type] ?? []).map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="acc-balance">Opening Balance (₹)</Label>
            <Input id="acc-balance" type="number" min="0" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Saving…" : "Add Account"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

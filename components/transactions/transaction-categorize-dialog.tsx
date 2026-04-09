"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface TransactionCategorizeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactions: Array<{
    id: string
    date: string
    description: string
    amount: number
    type: string
    category: string
  }>
  onSave: (categoryData: any) => void
}

export function TransactionCategorizeDialog({
  open,
  onOpenChange,
  transactions,
  onSave,
}: TransactionCategorizeDialogProps) {
  const [step, setStep] = useState(1)
  const [accountName, setAccountName] = useState("")
  const [accountType, setAccountType] = useState("")
  const [accountNature, setAccountNature] = useState("")
  const [details, setDetails] = useState("")

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      // Submit categorization
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = () => {
    // Call the onSave callback with the categorization data
    onSave({
      accountName,
      accountType,
      accountNature,
      details,
    })

    // Reset form and close dialog
    setStep(1)
    setAccountName("")
    setAccountType("")
    setAccountNature("")
    setDetails("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Categorize Transactions</DialogTitle>
          <DialogDescription>
            {transactions.length} similar transactions found. Let's categorize them together.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="account-name">Account Name</Label>
                <Input
                  id="account-name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g., Ram"
                />
              </div>
              <p className="text-sm text-muted-foreground">Enter a name for this account or contact.</p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>Account Type</Label>
              <RadioGroup value={accountType} onValueChange={setAccountType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense">Expense</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income">Income</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="asset" id="asset" />
                  <Label htmlFor="asset">Asset</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="liability" id="liability" />
                  <Label htmlFor="liability">Liability</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label htmlFor="account-nature">Nature of Account</Label>
              <Select value={accountNature} onValueChange={setAccountNature}>
                <SelectTrigger id="account-nature">
                  <SelectValue placeholder="Select nature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Label htmlFor="details">Additional Details (Optional)</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add any additional notes or details"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          ) : (
            <div></div>
          )}
          <Button onClick={handleNext}>{step < 4 ? "Next" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

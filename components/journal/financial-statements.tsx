"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, ChevronUp } from "lucide-react"
const defaultAccountBalances: Record<string, number> = {}

export function FinancialStatements({ entries }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [accountBalances, setAccountBalances] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  // Load account balances
  useEffect(() => {
    setAccountBalances(defaultAccountBalances)
    setIsLoading(false)
  }, [])

  // Calculate updated account balances based on current entries
  const getUpdatedBalances = () => {
    const updatedBalances = { ...accountBalances }

    // Process all entries
    entries.forEach((entry) => {
      entry.items.forEach((item) => {
        if (!item.account) return

        // Initialize account if it doesn't exist
        if (updatedBalances[item.account] === undefined) {
          updatedBalances[item.account] = 0
        }

        // Update balance based on debit/credit
        if (item.debit) {
          // For asset and expense accounts, debits increase the balance
          // For liability, equity, and revenue accounts, debits decrease the balance
          const accountType = getAccountType(item.account)
          if (accountType === "Asset" || accountType === "Expense") {
            updatedBalances[item.account] += Number(item.debit)
          } else {
            updatedBalances[item.account] -= Number(item.debit)
          }
        }

        if (item.credit) {
          // For asset and expense accounts, credits decrease the balance
          // For liability, equity, and revenue accounts, credits increase the balance
          const accountType = getAccountType(item.account)
          if (accountType === "Asset" || accountType === "Expense") {
            updatedBalances[item.account] -= Number(item.credit)
          } else {
            updatedBalances[item.account] += Number(item.credit)
          }
        }
      })
    })

    return updatedBalances
  }

  // Helper function to determine account type
  const getAccountType = (accountName) => {
    // This is a simplified approach - in a real app, you'd look up the account type from your accounts list
    if (
      accountName.includes("Cash") ||
      accountName.includes("Bank") ||
      accountName.includes("Receivable") ||
      accountName.includes("Inventory") ||
      accountName.includes("Equipment")
    ) {
      return "Asset"
    } else if (accountName.includes("Payable") || accountName.includes("Loan")) {
      return "Liability"
    } else if (accountName.includes("Capital") || accountName.includes("Equity")) {
      return "Equity"
    } else if (accountName.includes("Sales") || accountName.includes("Revenue") || accountName.includes("Income")) {
      return "Revenue"
    } else if (accountName.includes("Expense") || accountName.includes("Supplies")) {
      return "Expense"
    }
    return "Unknown"
  }

  const updatedBalances = getUpdatedBalances()

  // Calculate totals for balance sheet
  const totalAssets = Object.entries(updatedBalances).reduce((sum, [account, balance]) => {
    if (getAccountType(account) === "Asset") {
      return sum + Number(balance)
    }
    return sum
  }, 0)

  const totalLiabilities = Object.entries(updatedBalances).reduce((sum, [account, balance]) => {
    if (getAccountType(account) === "Liability") {
      return sum + Number(balance)
    }
    return sum
  }, 0)

  const totalEquity = Object.entries(updatedBalances).reduce((sum, [account, balance]) => {
    if (getAccountType(account) === "Equity") {
      return sum + Number(balance)
    }
    return sum
  }, 0)

  // Calculate totals for P&L
  const totalRevenue = Object.entries(updatedBalances).reduce((sum, [account, balance]) => {
    if (getAccountType(account) === "Revenue") {
      return sum + Number(balance)
    }
    return sum
  }, 0)

  const totalExpenses = Object.entries(updatedBalances).reduce((sum, [account, balance]) => {
    if (getAccountType(account) === "Expense") {
      return sum + Math.abs(Number(balance))
    }
    return sum
  }, 0)

  const netIncome = totalRevenue - totalExpenses

  // Update equity with net income
  const adjustedEquity = totalEquity + netIncome

  return (
    <div className="mt-8 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Financial Statements</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              Hide Statements
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" />
              Show Statements
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <Tabs defaultValue="balance-sheet" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
            <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
          </TabsList>
          <TabsContent value="balance-sheet">
            <Card>
              <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
                <CardDescription>
                  Statement of financial position as of {new Date().toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Assets */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Assets</h3>
                    <div className="space-y-1">
                      {Object.entries(updatedBalances)
                        .filter(([account]) => getAccountType(account) === "Asset")
                        .map(([account, balance]) => (
                          <div key={account} className="flex justify-between py-1 border-b">
                            <span>{account}</span>
                            <span>₹{Number(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      <div className="flex justify-between py-1 font-medium">
                        <span>Total Assets</span>
                        <span>₹{totalAssets.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Liabilities and Equity */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Liabilities</h3>
                    <div className="space-y-1">
                      {Object.entries(updatedBalances)
                        .filter(([account]) => getAccountType(account) === "Liability")
                        .map(([account, balance]) => (
                          <div key={account} className="flex justify-between py-1 border-b">
                            <span>{account}</span>
                            <span>₹{Number(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      <div className="flex justify-between py-1 font-medium">
                        <span>Total Liabilities</span>
                        <span>₹{totalLiabilities.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-medium mt-4 mb-2">Equity</h3>
                    <div className="space-y-1">
                      {Object.entries(updatedBalances)
                        .filter(([account]) => getAccountType(account) === "Equity")
                        .map(([account, balance]) => (
                          <div key={account} className="flex justify-between py-1 border-b">
                            <span>{account}</span>
                            <span>₹{Number(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      <div className="flex justify-between py-1 border-b">
                        <span>Net Income</span>
                        <span>₹{netIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between py-1 font-medium">
                        <span>Total Equity</span>
                        <span>₹{adjustedEquity.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t">
                      <div className="flex justify-between py-1 font-bold">
                        <span>Total Liabilities & Equity</span>
                        <span>
                          ₹{(totalLiabilities + adjustedEquity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="profit-loss">
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Statement</CardTitle>
                <CardDescription>Income statement for the current period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Revenue */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Revenue</h3>
                    <div className="space-y-1">
                      {Object.entries(updatedBalances)
                        .filter(([account]) => getAccountType(account) === "Revenue")
                        .map(([account, balance]) => (
                          <div key={account} className="flex justify-between py-1 border-b">
                            <span>{account}</span>
                            <span>₹{Number(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      <div className="flex justify-between py-1 font-medium">
                        <span>Total Revenue</span>
                        <span>₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Expenses</h3>
                    <div className="space-y-1">
                      {Object.entries(updatedBalances)
                        .filter(([account]) => getAccountType(account) === "Expense")
                        .map(([account, balance]) => (
                          <div key={account} className="flex justify-between py-1 border-b">
                            <span>{account}</span>
                            <span>
                              ₹{Math.abs(Number(balance)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      <div className="flex justify-between py-1 font-medium">
                        <span>Total Expenses</span>
                        <span>₹{totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between py-1 font-bold">
                      <span>Net Income</span>
                      <span>₹{netIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

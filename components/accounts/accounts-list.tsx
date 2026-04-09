"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getAccounts } from "@/app/actions/account-actions"

export function AccountsList({ refreshKey = 0 }: { refreshKey?: number }) {
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      const result = await getAccounts()
      if (result.data) setAccounts(result.data)
      setIsLoading(false)
    }
    load()
  }, [refreshKey])

  if (isLoading) {
    return <div>Loading accounts...</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                No accounts found. Add your first account using the button above.
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      account.type === "Asset"
                        ? "default"
                        : account.type === "Liability"
                          ? "secondary"
                          : account.type === "Income"
                            ? "outline"
                            : "destructive"
                    }
                  >
                    {account.type}
                  </Badge>
                </TableCell>
                <TableCell>{account.category}</TableCell>
                <TableCell className="text-right">₹{account.balance.toLocaleString("en-IN")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

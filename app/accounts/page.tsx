"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AccountsList } from "@/components/accounts/accounts-list"
import { AccountFormDialog } from "@/components/accounts/account-form-dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function AccountsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <DashboardShell>
      <DashboardHeader heading="Chart of Accounts" text="Manage your accounts and categories.">
        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </DashboardHeader>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>View and manage your chart of accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <AccountsList refreshKey={refreshKey} />
          </CardContent>
        </Card>
      </div>

      <AccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </DashboardShell>
  )
}

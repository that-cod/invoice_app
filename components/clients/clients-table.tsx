"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, Users, PlusCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ClientFormDialog } from "@/components/clients/client-form-dialog"
import { getClients, deleteClient } from "@/app/actions/client-actions"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function ClientsTable({ onRefresh }: { onRefresh?: () => void }) {
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getClients()
      if (result.data) setClients(result.data)
      setIsLoading(false)
    }
    load()
  }, [])

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading clients...</div>

  return <ClientsTableClient clients={clients} onRefresh={onRefresh} />
}

function ClientsTableClient({ clients, onRefresh }: { clients: any[]; onRefresh?: () => void }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<any>(null)

  const handleDeleteClick = (client: any) => {
    setClientToDelete(client)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return

    try {
      const { error } = await deleteClient(clientToDelete.id)

      if (error) {
        const isConstraintError =
          typeof error === "object" && error !== null &&
          "message" in error &&
          String((error as { message: string }).message).toLowerCase().includes("invoice")
        toast({
          title: "Cannot delete",
          description: isConstraintError
            ? `Cannot delete: ${clientToDelete.name} has existing invoices.`
            : "Failed to delete client. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Client deleted",
          description: `${clientToDelete.name} has been removed.`,
        })
        onRefresh?.()
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setClientToDelete(null)
    }
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="rounded-full bg-muted p-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No clients yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first client to start creating invoices.</p>
          </div>
          <ClientFormDialog onSuccess={onRefresh}>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </ClientFormDialog>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.email || "-"}</TableCell>
                <TableCell>{client.phone || "-"}</TableCell>
                <TableCell>{client.gstin || "-"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <ClientFormDialog client={client} onSuccess={() => onRefresh?.()}>
                          <button className="flex w-full items-center cursor-default">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </button>
                        </ClientFormDialog>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteClick(client)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the client <span className="font-medium">{clientToDelete?.name}</span>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

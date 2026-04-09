"use client"

import { useState, Suspense } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ProductsTable } from "@/components/products/products-table"
import { ProductFormDialog } from "@/components/products/product-form-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle } from "lucide-react"

export default function ProductsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const handleRefresh = () => setRefreshKey((k) => k + 1)

  return (
    <DashboardShell>
      <div className="animate-fade-in-up flex items-center justify-between pb-6 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products & Services</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your product catalog with HSN/SAC codes.</p>
        </div>
        <ProductFormDialog onSuccess={handleRefresh}>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </ProductFormDialog>
      </div>

      <div className="animate-fade-in">
        <Suspense fallback={<ProductsTableSkeleton />}>
          <ProductsTable key={refreshKey} onRefresh={handleRefresh} />
        </Suspense>
      </div>
    </DashboardShell>
  )
}

function ProductsTableSkeleton() {
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="h-12 border-b px-4 flex items-center bg-muted/30">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="p-4 space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}

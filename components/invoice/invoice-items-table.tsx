"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function InvoiceItemsTable({
  items,
  updateItem,
  removeItem,
  currencySymbol,
  showGst = false,
  gstRates = [0, 5, 12, 18, 28],
  products = [],
  showHsnSac = false,
}: {
  items: Record<string, any>[]
  updateItem: (id: number, field: string, value: any) => void
  removeItem: (id: number) => void
  currencySymbol: string
  showGst?: boolean
  gstRates?: number[]
  products?: Record<string, any>[]
  showHsnSac?: boolean
}) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header row */}
        <div
          className="grid gap-2 px-2 pb-2 border-b text-xs font-medium text-muted-foreground"
          style={{ gridTemplateColumns: buildGridTemplate({ products, showHsnSac, showGst }) }}
        >
          {products.length > 0 && <div>Product</div>}
          <div>Description</div>
          {showHsnSac && <div>HSN/SAC</div>}
          <div>Qty</div>
          <div>Rate</div>
          <div>Amount</div>
          {showGst && (
            <>
              <div>GST %</div>
              <div>GST Amt</div>
              <div>Total</div>
            </>
          )}
          <div />
        </div>

        {/* Item rows */}
        {items.map((item) => (
          <div
            key={item.id}
            className="grid gap-2 px-2 py-2 border-b last:border-b-0 items-center"
            style={{ gridTemplateColumns: buildGridTemplate({ products, showHsnSac, showGst }) }}
          >
            {/* Product selector */}
            {products.length > 0 && (
              <Select
                value={item.product_id || ""}
                onValueChange={(value) => updateItem(item.id, "product_id", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Item</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Description */}
            <Input
              className="w-full"
              value={item.description}
              onChange={(e) => updateItem(item.id, "description", e.target.value)}
              placeholder="Item description"
            />

            {/* HSN/SAC */}
            {showHsnSac && (
              <Input
                className="w-full"
                value={item.hsn_sac_code}
                onChange={(e) => updateItem(item.id, "hsn_sac_code", e.target.value)}
                placeholder="HSN/SAC"
              />
            )}

            {/* Quantity */}
            <Input
              type="number"
              min="0"
              className="w-full"
              value={item.quantity === 0 ? "" : item.quantity}
              placeholder="0"
              onChange={(e) => {
                const raw = e.target.valueAsNumber
                updateItem(item.id, "quantity", isNaN(raw) ? 0 : Math.max(0, raw))
              }}
            />

            {/* Rate */}
            <div className="relative w-full">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                {currencySymbol}
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                className="w-full pl-6"
                value={item.rate === 0 ? "" : item.rate}
                placeholder="0"
                onChange={(e) => {
                  const raw = e.target.valueAsNumber
                  updateItem(item.id, "rate", isNaN(raw) ? 0 : Math.max(0, raw))
                }}
              />
            </div>

            {/* Amount (read-only) */}
            <div className="text-sm font-medium whitespace-nowrap">
              {currencySymbol}{(item.quantity * item.rate).toFixed(2)}
            </div>

            {/* GST columns */}
            {showGst && (
              <>
                <Select
                  value={item.gstRate.toString()}
                  onValueChange={(value) => updateItem(item.id, "gstRate", Number(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="GST %" />
                  </SelectTrigger>
                  <SelectContent>
                    {gstRates.map((rate) => (
                      <SelectItem key={rate} value={rate.toString()}>
                        {rate}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="text-sm whitespace-nowrap">
                  {currencySymbol}{item.gstAmount.toFixed(2)}
                </div>

                <div className="text-sm font-medium whitespace-nowrap">
                  {currencySymbol}{item.totalAmount.toFixed(2)}
                </div>
              </>
            )}

            {/* Delete */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeItem(item.id)}
              disabled={items.length === 1}
              className="justify-self-center"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove item</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function buildGridTemplate({
  products,
  showHsnSac,
  showGst,
}: {
  products: Record<string, any>[]
  showHsnSac: boolean
  showGst: boolean
}) {
  const cols: string[] = []
  if (products.length > 0) cols.push("160px")   // Product selector
  cols.push("minmax(180px, 1fr)")                 // Description — grows
  if (showHsnSac) cols.push("100px")             // HSN/SAC
  cols.push("80px")                              // Qty
  cols.push("110px")                             // Rate
  cols.push("90px")                              // Amount
  if (showGst) {
    cols.push("90px")                            // GST %
    cols.push("80px")                            // GST Amt
    cols.push("90px")                            // Total
  }
  cols.push("40px")                              // Delete button
  return cols.join(" ")
}

import { createDbClient } from '@/lib/db'
import { InvoicePreview } from '@/components/invoice/invoice-preview'
import { SharePageActions } from './share-actions'

export default async function PublicInvoicePage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params
  const db = createDbClient()

  const { data: invoice } = await db
    .from('invoices')
    .select(`
      *,
      clients (id, name, email, address, gstin)
    `)
    .eq('share_id', shareId)
    .single()

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
          <p className="text-muted-foreground">This invoice link may be invalid or expired.</p>
        </div>
      </div>
    )
  }

  const { data: items } = await db
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoice.id)
    .order('created_at')

  // Load business profile
  const { data: profile } = await db
    .from('business_profile')
    .select('*')
    .eq('id', invoice.user_id)
    .single()

  const invoiceData = {
    invoiceNumber: invoice.invoice_number,
    invoiceDate: invoice.issue_date,
    dueDate: invoice.due_date,
    businessName: profile?.business_name || '',
    businessAddress: profile?.address || '',
    businessGstin: profile?.gstin || '',
    businessLogo: profile?.logo_url || '',
    businessState: profile?.state || '',
    clientName: invoice.clients?.name || '',
    clientAddress: invoice.clients?.address || '',
    clientGstin: invoice.clients?.gstin || '',
    placeOfSupply: invoice.place_of_supply || '',
    gstType: invoice.gst_type || 'CGST & SGST',
    taxType: invoice.tax_type || 'cgst_sgst',
    notes: invoice.notes || '',
    terms: invoice.terms || '',
    isExport: invoice.is_export || false,
  }

  const mappedItems = (items || []).map((item: Record<string, unknown>) => ({
    description: item.description as string,
    hsn_sac_code: item.hsn_sac_code as string,
    quantity: item.quantity as number,
    rate: item.rate as number,
    amount: item.amount as number,
    gstRate: item.gst_rate as number,
    gstAmount: item.gst_amount as number,
    totalAmount: item.total_amount as number,
  }))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl">
        <SharePageActions />
        <InvoicePreview
          invoiceData={invoiceData}
          items={mappedItems}
          currencySymbol={invoice.currency === 'USD' ? '$' : '₹'}
          subtotal={invoice.subtotal || 0}
          gstTotal={invoice.gst_total || 0}
          total={invoice.total || 0}
          theme={invoice.theme || 'classic'}
          taxType={invoice.tax_type || 'cgst_sgst'}
        />
        <div className="text-center mt-6 text-sm text-muted-foreground">
          Powered by FreeInvoiceIndia
        </div>
      </div>
    </div>
  )
}

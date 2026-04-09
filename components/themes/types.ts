export type InvoiceThemeProps = {
  invoiceData: {
    invoiceNumber: string
    invoiceDate: string
    dueDate?: string
    businessName: string
    businessAddress: string
    businessGstin: string
    businessLogo?: string
    businessState?: string
    clientName: string
    clientAddress: string
    clientGstin?: string
    clientState?: string
    placeOfSupply?: string
    gstType: string
    taxType?: 'cgst_sgst' | 'igst'
    notes?: string
    terms?: string
    isExport?: boolean
  }
  items: Array<{
    description: string
    hsn_sac_code?: string
    quantity: number
    rate: number
    amount: number
    gstRate: number
    gstAmount: number
    totalAmount: number
  }>
  subtotal: number
  gstTotal: number
  total: number
  currencySymbol: string
  taxType: 'cgst_sgst' | 'igst'
}

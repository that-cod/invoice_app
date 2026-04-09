import { ClassicTheme } from '@/components/themes/ClassicTheme'
import { ModernTheme } from '@/components/themes/ModernTheme'
import { GSTTheme } from '@/components/themes/GSTTheme'
import { FreelancerTheme } from '@/components/themes/FreelancerTheme'
import type { InvoiceThemeProps } from '@/components/themes/types'

const THEMES: Record<string, React.ComponentType<InvoiceThemeProps>> = {
  classic: ClassicTheme,
  modern: ModernTheme,
  gst: GSTTheme,
  freelancer: FreelancerTheme,
}

type InvoicePreviewProps = {
  invoiceData: Record<string, unknown>
  items: Array<Record<string, unknown>>
  currency?: string
  currencySymbol: string
  subtotal: number
  gstTotal: number
  total: number
  theme?: string
  taxType?: 'cgst_sgst' | 'igst'
}

export function InvoicePreview({
  invoiceData,
  items,
  currencySymbol,
  subtotal,
  gstTotal,
  total,
  theme = 'classic',
  taxType = 'cgst_sgst',
}: InvoicePreviewProps) {
  const ThemeComponent = THEMES[theme] || ClassicTheme

  const themeProps: InvoiceThemeProps = {
    invoiceData: {
      invoiceNumber: (invoiceData.invoiceNumber as string) || '',
      invoiceDate: (invoiceData.invoiceDate as string) || '',
      dueDate: invoiceData.dueDate as string,
      businessName: (invoiceData.businessName as string) || '',
      businessAddress: (invoiceData.businessAddress as string) || '',
      businessGstin: (invoiceData.businessGstin as string) || '',
      businessLogo: invoiceData.businessLogo as string,
      businessState: invoiceData.businessState as string,
      clientName: (invoiceData.clientName as string) || '',
      clientAddress: (invoiceData.clientAddress as string) || '',
      clientGstin: invoiceData.clientGstin as string,
      clientState: invoiceData.clientState as string,
      placeOfSupply: invoiceData.placeOfSupply as string,
      gstType: (invoiceData.gstType as string) || 'CGST & SGST',
      taxType: (invoiceData.taxType as 'cgst_sgst' | 'igst') || taxType,
      notes: invoiceData.notes as string,
      terms: invoiceData.terms as string,
      isExport: invoiceData.isExport as boolean,
    },
    items: items.map((item) => ({
      description: (item.description as string) || '',
      hsn_sac_code: item.hsn_sac_code as string,
      quantity: (item.quantity as number) || 0,
      rate: (item.rate as number) || 0,
      amount: (item.amount as number) || 0,
      gstRate: (item.gstRate as number) || 0,
      gstAmount: (item.gstAmount as number) || 0,
      totalAmount: (item.totalAmount as number) || 0,
    })),
    subtotal,
    gstTotal,
    total,
    currencySymbol,
    taxType,
  }

  return (
    <div id="invoice-preview-container">
      <ThemeComponent {...themeProps} />
    </div>
  )
}

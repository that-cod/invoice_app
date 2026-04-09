export const STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
  "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
  "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
  "16": "Tripura", "17": "Meghalaya", "18": "Assam",
  "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
  "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "26": "Dadra & Nagar Haveli", "27": "Maharashtra",
  "29": "Karnataka", "30": "Goa", "32": "Kerala",
  "33": "Tamil Nadu", "34": "Puducherry", "36": "Telangana",
  "37": "Andhra Pradesh", "38": "Ladakh"
}

export type TaxType = 'cgst_sgst' | 'igst'

export function getStateFromGSTIN(gstin: string): { code: string; name: string } | null {
  if (!gstin || gstin.length < 2) return null
  const code = gstin.substring(0, 2)
  const name = STATE_CODES[code]
  return name ? { code, name } : null
}

export function detectTaxType(sellerStateCode: string, buyerStateCode: string): TaxType {
  return sellerStateCode === buyerStateCode ? 'cgst_sgst' : 'igst'
}

export const HSN_SUGGESTIONS: Record<string, string> = {
  'Electronics': '8471',
  'Clothing': '6109',
  'Food & Beverages': '1905',
  'Software & IT Services': '8523',
  'Consulting Services': '9983',
  'Machinery': '8428',
  'Pharmaceuticals': '3004',
  'Construction': '9954',
  'Transportation': '9965',
  'Other': '9999',
}

export const ITEM_CATEGORIES = Object.keys(HSN_SUGGESTIONS)

export function amountToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function convertHundreds(n: number): string {
    if (n === 0) return ''
    if (n < 20) return ones[n] + ' '
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' '
    return ones[Math.floor(n / 100)] + ' Hundred ' + convertHundreds(n % 100)
  }

  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)

  if (rupees === 0 && paise === 0) return 'Zero Rupees Only'

  let result = ''
  const crore = Math.floor(rupees / 10000000)
  const lakh = Math.floor((rupees % 10000000) / 100000)
  const thousand = Math.floor((rupees % 100000) / 1000)
  const hundred = rupees % 1000

  if (crore) result += convertHundreds(crore) + 'Crore '
  if (lakh) result += convertHundreds(lakh) + 'Lakh '
  if (thousand) result += convertHundreds(thousand) + 'Thousand '
  if (hundred) result += convertHundreds(hundred)

  result = result.trim()
  if (paise > 0) result += ` and ${convertHundreds(paise).trim()} Paise`
  return result + ' Only'
}

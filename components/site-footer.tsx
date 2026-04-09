import Link from "next/link"
import { FileText } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm">FreeInvoiceIndia</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Free GST Invoice & Accounting Software for Indian Businesses
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Features</h3>
            <ul className="space-y-2">
              {["GST Invoicing", "Client Management", "Expense Tracking"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-2">
              {["Help Center", "Blog", "GST Guide"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} FreeInvoiceIndia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

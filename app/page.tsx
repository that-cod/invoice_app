import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PublicPageWrapper } from "@/components/public-page-wrapper"
import {
  FileText, Users, DollarSign, BarChart2, Receipt, Package,
  CheckCircle2, ArrowRight, Shield, Zap, Globe,
} from "lucide-react"

export const metadata = {
  title: "FreeInvoiceIndia – Free GST Invoice & Accounting Software",
  description:
    "Create professional GST invoices, manage clients, track expenses, and handle accounting — all free for Indian businesses.",
  keywords:
    "GST invoice software, free accounting software, Indian business software, GST billing software, invoice generator India",
}

const FEATURES = [
  {
    icon: FileText,
    title: "GST Invoicing",
    desc: "Professional invoices with auto CGST, SGST & IGST calculation based on state.",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    icon: Users,
    title: "Client Management",
    desc: "Store and manage all your client details and billing history in one place.",
    color: "text-violet-600",
    bg: "bg-violet-500/10",
  },
  {
    icon: DollarSign,
    title: "Expense Tracking",
    desc: "Categorise expenses and get a clear picture of your outgoings each month.",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    icon: BarChart2,
    title: "Financial Dashboard",
    desc: "Visual reports on revenue, expenses, and outstanding amounts at a glance.",
    color: "text-orange-600",
    bg: "bg-orange-500/10",
  },
  {
    icon: Receipt,
    title: "GST Reports",
    desc: "Generate GSTR-ready reports to simplify your quarterly filings.",
    color: "text-rose-600",
    bg: "bg-rose-500/10",
  },
  {
    icon: Package,
    title: "Product Catalog",
    desc: "Manage products and services with HSN/SAC codes for quick invoice line items.",
    color: "text-teal-600",
    bg: "bg-teal-500/10",
  },
]

const PRICING_FEATURES = [
  "Unlimited GST Invoices",
  "Client Management",
  "Expense Tracking",
  "Financial Dashboard",
  "GST Reports",
  "Product Catalog",
  "PDF Download & Print",
  "Email Invoice Sharing",
  "HSN / SAC Code Support",
]

const TRUST_ITEMS = [
  { icon: Shield, label: "Secure & Private", desc: "Your data never leaves your account" },
  { icon: Zap, label: "Lightning Fast", desc: "Create an invoice in under 60 seconds" },
  { icon: Globe, label: "India-First", desc: "Built for GST, HSN/SAC & Indian states" },
]

export default function HomePage() {
  return (
    <PublicPageWrapper>
      <div className="flex flex-col min-h-screen">

        {/* ── Hero ── */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/60 px-4 py-1.5 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Free forever · No credit card required
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                GST Invoicing<br className="hidden sm:block" />{" "}
                <span className="text-primary">made simple</span>
              </h1>
              <p className="max-w-xl mx-auto text-muted-foreground text-lg md:text-xl">
                Create professional GST invoices, auto-detect CGST/SGST/IGST, manage clients and track your finances — built for Indian businesses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button asChild size="lg" className="text-base h-12 px-8">
                  <Link href="/signup">
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base h-12 px-8">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust bar ── */}
        <section className="w-full border-y bg-muted/30 py-8">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {TRUST_ITEMS.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="w-full py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Everything your business needs
              </h2>
              <p className="max-w-xl mx-auto text-muted-foreground md:text-lg">
                Comprehensive tools designed specifically for Indian businesses and freelancers.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto animate-in-stagger">
              {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
                <div
                  key={title}
                  className="group flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm transition-all duration-normal ease-out-expo hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="w-full py-20 md:py-28 bg-muted/30 border-y">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-3 mb-10">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Simple, transparent pricing</h2>
              <p className="max-w-md mx-auto text-muted-foreground md:text-lg">
                No hidden fees, no tiers. Just free, powerful tools.
              </p>
            </div>
            <div className="max-w-sm mx-auto">
              <div className="rounded-2xl border bg-card shadow-lg overflow-hidden">
                <div className="bg-primary p-8 text-center text-primary-foreground">
                  <p className="text-sm font-medium uppercase tracking-widest mb-2 text-primary-foreground/70">Plan</p>
                  <h3 className="text-4xl font-bold">₹0</h3>
                  <p className="text-primary-foreground/70 mt-1">Free Forever</p>
                </div>
                <div className="p-8 space-y-6">
                  <ul className="space-y-3">
                    {PRICING_FEATURES.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/signup">
                      Get started free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">No credit card required</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="w-full py-20 md:py-28 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Ready to simplify your business finances?
              </h2>
              <p className="text-primary-foreground/70 md:text-lg">
                Join Indian businesses using FreeInvoiceIndia for invoicing and accounting.
              </p>
              <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-base">
                <Link href="/signup">
                  Sign up now — it&apos;s free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </PublicPageWrapper>
  )
}

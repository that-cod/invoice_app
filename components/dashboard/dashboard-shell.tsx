"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  ArrowLeftRight,
  BookOpen,
  Landmark,
  BarChart2,
  Settings,
  LogOut,
  PlusCircle,
  Menu,
  X,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/products", label: "Products", icon: Package, comingSoon: true },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, comingSoon: true },
  { href: "/journal", label: "Journal", icon: BookOpen, comingSoon: true },
  { href: "/accounts", label: "Accounts", icon: Landmark, comingSoon: true },
  { href: "/reports", label: "Reports", icon: BarChart2, comingSoon: true },
]

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <>
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm transition-transform duration-normal ease-out-expo group-hover:scale-105">
            {user?.business_name?.charAt(0)?.toUpperCase() || "F"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm truncate">
              {user?.business_name || "FreeInvoiceIndia"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user?.gstin || "Business Account"}
            </span>
          </div>
        </Link>
      </div>

      <div className="p-3">
        <Button asChild className="w-full justify-center gap-2" size="sm">
          <Link href="/invoices/create" onClick={() => setMobileOpen(false)}>
            <PlusCircle className="h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          if (item.comingSoon) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium opacity-50 cursor-not-allowed select-none"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{item.label}</span>
                <span className="ml-auto text-[10px] font-medium bg-muted text-muted-foreground rounded px-1.5 py-0.5 leading-none">
                  Soon
                </span>
              </div>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-normal ease-out-expo",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 transition-colors duration-fast", isActive && "text-primary")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t px-3 py-3 space-y-0.5">
        <Link
          href="/settings"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-normal ease-out-expo",
            pathname === "/settings"
              ? "bg-primary/10 text-primary shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={() => { signOut(); setMobileOpen(false) }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-normal ease-out-expo"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card/50 backdrop-blur-sm">
        {sidebarContent}
      </aside>

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex md:hidden h-14 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
            {user?.business_name?.charAt(0)?.toUpperCase() || "F"}
          </div>
          <span className="font-semibold text-sm">{user?.business_name || "FreeInvoiceIndia"}</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-14 bottom-0 w-72 border-r bg-card flex flex-col animate-slide-in-right shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto md:mt-0 mt-14">
        <div className={cn("py-6 px-4 md:px-8 max-w-7xl mx-auto w-full grid items-start gap-8", className)} {...props}>
          {children}
        </div>
      </main>
    </div>
  )
}

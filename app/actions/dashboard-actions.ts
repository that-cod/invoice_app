"use server"

import { createDbClient } from "@/lib/db"
import { getUserIdFromCookie } from "@/lib/server-auth"

export async function getFinancialSummary() {
  const userId = await getUserIdFromCookie()
  if (!userId) return { data: null, error: "Unauthorized" }

  const db = createDbClient()

  const [revenueRes, outstandingRes, bankRes, expenseRes] = await Promise.all([
    db.from("invoices").select("total").eq("user_id", userId).eq("status", "paid"),
    db.from("invoices").select("total").eq("user_id", userId).in("status", ["pending", "overdue"]),
    db.from("accounts").select("balance").eq("user_id", userId).eq("name", "Bank Account").single(),
    db.from("transactions").select("amount").eq("user_id", userId).eq("type", "debit"),
  ])

  const totalRevenue = revenueRes.data?.reduce((sum: number, inv: { total: number }) => sum + inv.total, 0) || 0
  const outstandingInvoices = outstandingRes.data?.reduce((sum: number, inv: { total: number }) => sum + inv.total, 0) || 0
  const bankBalance = (bankRes.data as any)?.balance || 0
  const totalExpenses = expenseRes.data?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0

  return {
    data: { totalRevenue, outstandingInvoices, bankBalance, totalExpenses },
    error: null,
  }
}

export async function getRecentInvoices() {
  const userId = await getUserIdFromCookie()
  if (!userId) return { data: null, error: "Unauthorized" }

  const db = createDbClient()
  const { data, error } = await db
    .from("invoices")
    .select(`id, invoice_number, issue_date, due_date, status, total, clients (name)`)
    .eq("user_id", userId)
    .order("issue_date", { ascending: false })
    .limit(5)

  return { data, error: error?.message || null }
}

export async function getTransactionSummary() {
  const userId = await getUserIdFromCookie()
  if (!userId) return { data: null, error: "Unauthorized" }

  const db = createDbClient()
  const { data, error } = await db
    .from("transactions")
    .select("date, amount, type")
    .eq("user_id", userId)
    .order("date")

  return { data, error: error?.message || null }
}

export async function getGSTSummary() {
  const userId = await getUserIdFromCookie()
  if (!userId) return { data: null, error: "Unauthorized" }

  const db = createDbClient()
  const { data, error } = await db
    .from("gst_summary")
    .select("*")
    .eq("user_id", userId)
    .order("year")
    .order("month")

  return { data, error: error?.message || null }
}

export async function getITCSummary() {
  const userId = await getUserIdFromCookie()
  if (!userId) return { data: null, error: "Unauthorized" }

  const db = createDbClient()
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Try current month's GST summary view
  const { data: summaryData } = await db
    .from("gst_summary")
    .select("*")
    .eq("user_id", userId)
    .eq("month", currentMonth)
    .eq("year", currentYear)
    .single()

  if (summaryData) {
    return { data: summaryData, error: null }
  }

  // Fallback: calculate from raw invoices
  const { data: invoices } = await db
    .from("invoices")
    .select("gst_total, gst_type")
    .eq("user_id", userId)
    .gte("issue_date", `${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`)
    .lt(
      "issue_date",
      currentMonth === 12
        ? `${currentYear + 1}-01-01`
        : `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}-01`
    )

  let cgst_collected = 0, sgst_collected = 0, igst_collected = 0
  ;(invoices as any[])?.forEach((inv: { gst_total: number; gst_type: string }) => {
    if (inv.gst_type === "IGST") {
      igst_collected += inv.gst_total
    } else {
      cgst_collected += inv.gst_total / 2
      sgst_collected += inv.gst_total / 2
    }
  })

  return {
    data: {
      cgst_collected,
      sgst_collected,
      igst_collected,
      cgst_paid: 0,
      sgst_paid: 0,
      igst_paid: 0,
      net_cgst: -cgst_collected,
      net_sgst: -sgst_collected,
      net_igst: -igst_collected,
    },
    error: null,
  }
}

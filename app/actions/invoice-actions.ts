"use server"

import { createDbClient } from "@/lib/db"
import { getUserIdFromCookie } from "@/lib/server-auth"
import { revalidatePath } from "next/cache"

// Inlined here to avoid importing from lib/utils.ts (shared client/server module)
// which causes Next.js Webpack bundler boundary issues with "use server" files.
function sanitizeText(input: string | null | undefined): string {
  if (!input) return ""
  return input.replace(/<[^>]*>/g, "").trim()
}

export async function getInvoices() {
  const userId = await getUserIdFromCookie()
  if (!userId) return { data: [], error: "Unauthorized" }

  const db = createDbClient()

  try {
    const { data, error } = await db
      .from("invoices")
      .select(`
        *,
        clients (
          id,
          name
        )
      `)
      .eq("user_id", userId)
      .order("issue_date", { ascending: false })

    if (error) {
      console.error("Error fetching invoices:", error)
      return { data: [], error: error.message }
    }

    return { data: data || [] }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Error fetching invoices:", message)
    return { data: [], error: message }
  }
}

export async function getInvoiceById(id: string) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: "Unauthorized" }

  const db = createDbClient()

  try {
    const { data: invoice, error: invoiceError } = await db
      .from("invoices")
      .select(`
        *,
        clients (
          id,
          name,
          email,
          address,
          gstin
        )
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (invoiceError) {
      console.error("Error fetching invoice:", invoiceError)
      return { error: invoiceError.message }
    }

    const { data: items, error: itemsError } = await db
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("created_at")

    if (itemsError) {
      console.error("Error fetching invoice items:", itemsError)
      return { error: itemsError.message }
    }

    return { data: { ...invoice, items } }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Error fetching invoice:", message)
    return { error: message }
  }
}

export async function createInvoice(invoiceData: Record<string, unknown>, items: Record<string, unknown>[]) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  const shareId = crypto.randomUUID()

  const sanitizedData = {
    ...invoiceData,
    notes: sanitizeText(invoiceData.notes as string),
    terms: sanitizeText(invoiceData.terms as string),
  }

  const { data: invoice, error: invoiceError } = await db
    .from("invoices")
    .insert([{ ...sanitizedData, user_id: userId, share_id: shareId }])
    .select()

  if (invoiceError) {
    console.error("Error creating invoice:", invoiceError)
    const msg = invoiceError.message || ""
    if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("23505")) {
      return {
        error: {
          message: `Invoice number "${invoiceData.invoice_number}" already exists. Please use a different number.`,
        },
      }
    }
    return { error: invoiceError }
  }

  const invoiceItems = items.map((item) => ({
    ...item,
    invoice_id: (invoice as any[])[0].id,
  }))

  const { error: itemsError } = await db.from("invoice_items").insert(invoiceItems)

  if (itemsError) {
    // Rollback: delete the invoice so we don't leave orphaned records
    await db.from("invoices").delete().eq("id", (invoice as any[])[0].id)
    console.error("Error creating invoice items (rolled back):", itemsError)
    return { error: { message: "Failed to save invoice items. Please try again." } }
  }

  revalidatePath("/invoices")
  return { data: (invoice as any[])[0] }
}

export async function updateInvoice(id: string, invoiceData: Record<string, unknown>, items: Record<string, unknown>[]) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  const sanitizedData = {
    ...invoiceData,
    notes: sanitizeText(invoiceData.notes as string),
    terms: sanitizeText(invoiceData.terms as string),
  }

  const { data: invoice, error: invoiceError } = await db
    .from("invoices")
    .update({ ...sanitizedData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()

  if (invoiceError) {
    console.error("Error updating invoice:", invoiceError)
    return { error: invoiceError }
  }

  await db.from("invoice_items").delete().eq("invoice_id", id)

  const invoiceItems = items.map((item) => ({ ...item, invoice_id: id }))
  const { error: itemsError } = await db.from("invoice_items").insert(invoiceItems)

  if (itemsError) {
    console.error("Error updating invoice items:", itemsError)
    return { error: itemsError }
  }

  revalidatePath("/invoices")
  revalidatePath(`/invoices/${id}`)
  return { data: (invoice as any[])[0] }
}

export async function updateInvoiceStatus(id: string, status: string) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  const { data, error } = await db
    .from("invoices")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()

  if (error) {
    console.error("Error updating invoice status:", error)
    return { error }
  }

  revalidatePath("/invoices")
  revalidatePath(`/invoices/${id}`)
  return { data: (data as any[])[0] }
}

export async function deleteInvoice(id: string) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  const { error } = await db.from("invoices").delete().eq("id", id).eq("user_id", userId)

  if (error) {
    console.error("Error deleting invoice:", error)
    return { error }
  }

  revalidatePath("/invoices")
  return { success: true }
}

export async function getNextInvoiceNumber() {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()
  const year = new Date().getFullYear()

  const { data, error } = await db
    .from("invoices")
    .select("invoice_number")
    .eq("user_id", userId)
    .like("invoice_number", `INV-${year}-%`)
    .order("invoice_number", { ascending: false })
    .limit(1)

  if (error) {
    console.error("Error getting next invoice number:", error)
    return { error }
  }

  if (!data || (data as any[]).length === 0) {
    return { data: `INV-${year}-0001` }
  }

  const lastNumber = (data as any[])[0].invoice_number
  const matches = lastNumber.match(/INV-\d{4}-(\d+)/)

  if (!matches || matches.length < 2) {
    return { data: `INV-${year}-0001` }
  }

  const nextNumber = Number.parseInt(matches[1]) + 1
  const paddedNumber = nextNumber.toString().padStart(4, "0")

  return { data: `INV-${year}-${paddedNumber}` }
}

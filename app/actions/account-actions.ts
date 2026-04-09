"use server"

import { createDbClient } from "@/lib/db"
import { getUserIdFromCookie } from "@/lib/server-auth"
import { revalidatePath } from "next/cache"

export async function getAccounts() {
  const userId = await getUserIdFromCookie()
  if (!userId) return { data: null, error: "Unauthorized" }

  const db = createDbClient()
  const { data, error } = await db
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("name")

  return { data, error: error?.message || null }
}

export async function createAccount(accountData: {
  name: string
  type: string
  category: string
  balance: number
}) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { data: null, error: "Unauthorized" }

  const db = createDbClient()
  const { data, error } = await db
    .from("accounts")
    .insert([{ ...accountData, user_id: userId }])
    .select()

  if (error) {
    console.error("Error creating account:", error)
    return { data: null, error: error.message }
  }

  revalidatePath("/accounts")
  return { data: (data as any[])?.[0] ?? null, error: null }
}

export async function updateAccount(id: string, accountData: { name?: string; type?: string; category?: string; balance?: number }) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { data: null, error: "Unauthorized" }

  const db = createDbClient()
  const { data, error } = await db
    .from("accounts")
    .update({ ...accountData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()

  if (error) {
    console.error("Error updating account:", error)
    return { data: null, error: error.message }
  }

  revalidatePath("/accounts")
  return { data: (data as any[])?.[0] ?? null, error: null }
}

export async function deleteAccount(id: string) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: "Unauthorized" }

  const db = createDbClient()
  const { error } = await db.from("accounts").delete().eq("id", id).eq("user_id", userId)

  if (error) {
    console.error("Error deleting account:", error)
    return { error: error.message }
  }

  revalidatePath("/accounts")
  return { error: null }
}

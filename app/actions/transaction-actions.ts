"use server"

import { createDbClient } from "@/lib/db"
import { getUserIdFromCookie } from "@/lib/server-auth"
import { revalidatePath } from "next/cache"

export async function getTransactions() {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  const { data, error } = await db.from("transactions").select("*").eq("user_id", userId).order("date", { ascending: false })

  if (error) {
    console.error("Error fetching transactions:", error)
    return { error }
  }

  return { data }
}

export async function categorizeTransactions(transactionIds: string[], categoryData: Record<string, unknown>) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  let accountId: string | null = null

  if (categoryData.accountName) {
    const { data: existingAccount } = await db
      .from("accounts")
      .select("id")
      .eq("name", categoryData.accountName as string)
      .eq("user_id", userId)
      .single()

    if (existingAccount) {
      accountId = (existingAccount as any).id
    } else {
      const { data: newAccount, error: accountError } = await db
        .from("accounts")
        .insert([
          {
            name: categoryData.accountName,
            type: categoryData.accountType || "Expense",
            category: categoryData.accountNature || "Uncategorized",
            balance: 0,
            user_id: userId,
          },
        ])
        .select()

      if (accountError) {
        console.error("Error creating account:", accountError)
        return { error: accountError }
      }

      accountId = (newAccount as any[])[0].id
    }
  }

  const { error } = await db
    .from("transactions")
    .update({
      category: (categoryData.accountName as string) || "Uncategorized",
      account_id: accountId,
      is_categorized: true,
      updated_at: new Date().toISOString(),
    })
    .in("id", transactionIds)
    .eq("user_id", userId)

  if (error) {
    console.error("Error categorizing transactions:", error)
    return { error }
  }

  if (accountId) {
    const { data: transactions } = await db
      .from("transactions")
      .select("amount,type")
      .eq("account_id", accountId)
      .eq("user_id", userId)

    if (transactions) {
      const balance = (transactions as any[]).reduce((sum: number, tx: { amount: number; type: string }) => {
        return sum + (tx.type === "credit" ? tx.amount : -tx.amount)
      }, 0)

      await db.from("accounts").update({ balance, updated_at: new Date().toISOString() }).eq("id", accountId)
    }
  }

  revalidatePath("/transactions")
  return { success: true }
}

export async function uploadBankStatement(transactions: Record<string, unknown>[]) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  const transactionsWithUser = transactions.map((t) => ({ ...t, user_id: userId }))

  const { error } = await db.from("transactions").insert(transactionsWithUser)

  if (error) {
    console.error("Error uploading bank statement:", error)
    return { error }
  }

  revalidatePath("/transactions")
  return { success: true }
}

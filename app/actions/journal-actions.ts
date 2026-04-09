"use server"

import { createDbClient } from "@/lib/db"
import { getUserIdFromCookie } from "@/lib/server-auth"

type JournalItem = { id: number; account: string; debit: number; credit: number }
type JournalEntry = { id: number; date: string; narration: string; items: JournalItem[] }

export async function saveJournalEntries(entries: JournalEntry[]) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: "Unauthorized" }

  const db = createDbClient()

  for (const entry of entries) {
    const totalDebit = entry.items.reduce((sum, item) => sum + (item.debit || 0), 0)

    const { data: saved, error: entryError } = await db
      .from("journal_entries")
      .insert([
        {
          user_id: userId,
          entry_date: entry.date,
          narration: entry.narration,
          total_amount: totalDebit,
        },
      ])
      .select()

    if (entryError) {
      return { error: entryError.message }
    }

    const journalEntryId = saved[0].id

    const itemRows = entry.items.map((item) => ({
      journal_entry_id: journalEntryId,
      account_name: item.account,
      debit: item.debit || 0,
      credit: item.credit || 0,
    }))

    const { error: itemsError } = await db.from("journal_entry_items").insert(itemRows)

    if (itemsError) {
      return { error: itemsError.message }
    }
  }

  return { success: true }
}

export async function getJournalEntries() {
  const userId = await getUserIdFromCookie()
  if (!userId) return { data: null, error: "Unauthorized" }

  const db = createDbClient()
  const { data, error } = await db
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .limit(20)

  return { data, error: error?.message || null }
}

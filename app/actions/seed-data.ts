"use server"

import { createDbClient } from "@/lib/db"
import { getUserIdFromCookie } from "@/lib/server-auth"

export async function seedInitialData() {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: "Unauthorized" }

  const db = createDbClient()

  // Create sample clients
  const { data: existingClients } = await db.from("clients").select("id").eq("user_id", userId).limit(1)

  if (!existingClients || existingClients.length === 0) {
    await db.from("clients").insert([
      {
        name: "Acme Corp",
        email: "accounts@acmecorp.com",
        address: "123 Business Park, Mumbai, Maharashtra, 400001",
        gstin: "27AAAAA0000A1Z5",
        phone: "+91 9876543210",
        user_id: userId,
      },
      {
        name: "Tech Titans",
        email: "finance@techtitans.com",
        address: "456 Tech Hub, Bangalore, Karnataka, 560001",
        gstin: "29BBBBB0000B1Z3",
        phone: "+91 9876543211",
        user_id: userId,
      },
      {
        name: "Global Innovations",
        email: "accounts@globalinnovations.com",
        address: "789 Innovation Center, Delhi, Delhi, 110001",
        gstin: "07CCCCC0000C1Z1",
        phone: "+91 9876543212",
        user_id: userId,
      },
    ])
  }

  // Create sample accounts
  const { data: existingAccounts } = await db.from("accounts").select("id").eq("user_id", userId).limit(1)

  if (!existingAccounts || existingAccounts.length === 0) {
    await db.from("accounts").insert([
      { name: "Cash", type: "Asset", category: "Current Asset", balance: 125000, user_id: userId },
      { name: "Bank Account", type: "Asset", category: "Current Asset", balance: 450000, user_id: userId },
      { name: "Accounts Receivable", type: "Asset", category: "Current Asset", balance: 75000, user_id: userId },
      { name: "Sales", type: "Income", category: "Revenue", balance: 850000, user_id: userId },
      { name: "Salary Expense", type: "Expense", category: "Direct Expense", balance: 350000, user_id: userId },
    ])
  }

  return { success: true }
}

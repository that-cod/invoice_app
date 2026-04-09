"use server"

import { createDbClient } from "@/lib/db"
import { getUserIdFromCookie } from "@/lib/server-auth"
import { revalidatePath } from "next/cache"

export async function getClients() {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) return { data: null, error: "Unauthorized" }

    const db = createDbClient()
    const { data, error } = await db.from("clients").select("*").eq("user_id", userId).order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching clients:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in getClients:", error)
    return { data: null, error: "Failed to fetch clients" }
  }
}

export async function getClient(id: string) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) return { data: null, error: "Unauthorized" }

    const db = createDbClient()
    const { data, error } = await db.from("clients").select("*").eq("id", id).eq("user_id", userId).single()

    if (error) {
      console.error("Error fetching client:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error in getClient:", error)
    return { data: null, error: "Failed to fetch client" }
  }
}

export async function createClient(formData: FormData | { name: string; email?: string; phone?: string; address?: string; gstin?: string }) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) return { data: null, error: "Unauthorized" }

    const get = (key: string) =>
      formData instanceof FormData ? (formData.get(key) as string) : (formData as Record<string, string>)[key]

    const name = get("name")
    const email = get("email")
    const phone = get("phone")
    const address = get("address")
    const gstin = get("gstin")

    if (!name) {
      return { data: null, error: "Name is required" }
    }

    const db = createDbClient()
    const { data, error } = await db
      .from("clients")
      .insert([{ name, email: email || null, phone: phone || null, address: address || null, gstin: gstin ? gstin.toUpperCase().trim() : null, user_id: userId }])
      .select()
      .single()

    if (error) {
      console.error("Error creating client:", error)
      return { data: null, error: error.message }
    }

    revalidatePath("/clients")
    return { data, error: null }
  } catch (error) {
    console.error("Error in createClient:", error)
    return { data: null, error: "Failed to create client" }
  }
}

export async function updateClient(id: string, formData: FormData | { name: string; email?: string; phone?: string; address?: string; gstin?: string }) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) return { data: null, error: "Unauthorized" }

    const get = (key: string) =>
      formData instanceof FormData ? (formData.get(key) as string) : (formData as Record<string, string>)[key]

    const name = get("name")
    const email = get("email")
    const phone = get("phone")
    const address = get("address")
    const gstin = get("gstin")

    if (!name) {
      return { data: null, error: "Name is required" }
    }

    const db = createDbClient()
    const { data, error } = await db
      .from("clients")
      .update({ name, email: email || null, phone: phone || null, address: address || null, gstin: gstin ? gstin.toUpperCase().trim() : null })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating client:", error)
      return { data: null, error: error.message }
    }

    revalidatePath("/clients")
    return { data, error: null }
  } catch (error) {
    console.error("Error in updateClient:", error)
    return { data: null, error: "Failed to update client" }
  }
}

export async function deleteClient(id: string) {
  try {
    const userId = await getUserIdFromCookie()
    if (!userId) return { error: "Unauthorized" }

    const db = createDbClient()
    const { error } = await db.from("clients").delete().eq("id", id).eq("user_id", userId)

    if (error) {
      console.error("Error deleting client:", error)
      return { error: error.message }
    }

    revalidatePath("/clients")
    return { error: null }
  } catch (error) {
    console.error("Error in deleteClient:", error)
    return { error: "Failed to delete client" }
  }
}

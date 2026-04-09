"use server"

import { createDbClient as createDbClient } from "@/lib/db"
import { getUserIdFromCookie } from "@/lib/server-auth"
import { revalidatePath } from "next/cache"

export async function getProducts() {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  const { data, error } = await db.from("products").select("*").eq("user_id", userId).order("name")

  if (error) {
    console.error("Error fetching products:", error)
    return { error }
  }

  // Normalise: DB column may be "price" but front-end expects "rate"
  const normalised = (data ?? []).map((p: any) => ({
    ...p,
    rate: p.rate ?? p.price ?? 0,
  }))

  return { data: normalised }
}

export async function getProductById(id: string) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  const { data, error } = await db.from("products").select("*").eq("id", id).eq("user_id", userId).single()

  if (error) {
    console.error("Error fetching product:", error)
    return { error }
  }

  return { data: data ? { ...data, rate: (data as any).rate ?? (data as any).price ?? 0 } : null }
}

export async function createProduct(productData: Record<string, unknown>) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  if (!productData.name) {
    return { error: { message: "Product name is required" } }
  }

  // Map front-end "rate" → DB "price"; keep both so it works regardless of schema version
  const { rate, ...rest } = productData
  const { data, error } = await db
    .from("products")
    .insert([{ ...rest, price: rate ?? 0, user_id: userId }])
    .select()

  if (error) {
    console.error("Error creating product:", error)
    return { error }
  }

  revalidatePath("/products")
  const row = data[0] ?? {}
  return { data: { ...row, rate: row.rate ?? row.price ?? rate ?? 0 } }
}

export async function updateProduct(id: string, productData: Record<string, unknown>) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  if (!productData.name) {
    return { error: { message: "Product name is required" } }
  }

  const { rate, ...rest } = productData
  const { data, error } = await db
    .from("products")
    .update({ ...rest, price: rate ?? 0, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()

  if (error) {
    console.error("Error updating product:", error)
    return { error }
  }

  revalidatePath("/products")
  const row = data[0] ?? {}
  return { data: { ...row, rate: row.rate ?? row.price ?? rate ?? 0 } }
}

export async function deleteProduct(id: string) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  const { error } = await db.from("products").delete().eq("id", id).eq("user_id", userId)

  if (error) {
    console.error("Error deleting product:", error)
    return { error }
  }

  revalidatePath("/products")
  return { success: true }
}

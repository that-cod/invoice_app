"use server"

import { createDbClient } from "@/lib/db"
import { getUserIdFromCookie } from "@/lib/server-auth"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function getBusinessProfile() {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  const { data, error } = await db.from("business_profile").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching business profile:", error)
    return { error }
  }

  return { data }
}

export async function updateBusinessProfile(profileData: Record<string, unknown>) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const db = createDbClient()

  const normalizedData = {
    ...profileData,
    ...(profileData.gstin
      ? { gstin: (profileData.gstin as string).toUpperCase().trim() }
      : {}),
  }

  const { data, error } = await db
    .from("business_profile")
    .update({
      ...normalizedData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()

  if (error) {
    console.error("Error updating business profile:", error)
    return { error }
  }

  revalidatePath("/")
  return { data: (data as any[])[0] }
}

export async function uploadBusinessLogo(file: File) {
  const userId = await getUserIdFromCookie()
  if (!userId) return { error: { message: "Unauthorized" } }

  const ext = file.name.split(".").pop() || "png"
  const fileName = `logo-${userId}-${Date.now()}.${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads", "logos")

  await mkdir(uploadDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(uploadDir, fileName), buffer)

  const logoUrl = `/uploads/logos/${fileName}`

  const db = createDbClient()
  await db
    .from("business_profile")
    .update({ logo_url: logoUrl, updated_at: new Date().toISOString() })
    .eq("id", userId)

  revalidatePath("/")
  return { data: { url: logoUrl } }
}

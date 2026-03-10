import { cookies, headers } from "next/headers"
import { prisma } from "@/lib/db"

export type AuthenticatedSupplier = {
  id: string
  companyName: string
  email: string
  apiActive: boolean
  isActive: boolean
  portalActive: boolean
  portalUsername: string | null
}

const supplierSelect = {
  id: true,
  companyName: true,
  email: true,
  apiActive: true,
  isActive: true,
  portalActive: true,
  portalUsername: true,
} as const

export async function getAuthenticatedSupplier() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("supplier-session")?.value

  if (sessionId) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: sessionId },
      select: supplierSelect,
    })

    if (supplier?.isActive && supplier.portalActive) {
      return supplier
    }
  }

  const headersList = await headers()
  const authHeader = headersList.get("authorization")

  if (authHeader?.startsWith("Bearer ")) {
    const apiKey = authHeader.substring(7)
    const supplier = await prisma.supplier.findUnique({
      where: { apiKey },
      select: supplierSelect,
    })

    if (supplier?.isActive && supplier.apiActive) {
      return supplier
    }
  }

  return null
}

export async function getAuthenticatedSupplierPortalSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("supplier-session")?.value

  if (!sessionId) {
    return null
  }

  const supplier = await prisma.supplier.findUnique({
    where: { id: sessionId },
    select: supplierSelect,
  })

  if (!supplier?.isActive || !supplier.portalActive) {
    return null
  }

  return supplier
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
// @ts-ignore
import bcrypt from "bcrypt"
import crypto from "crypto"

async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin-session")
  if (!adminSession) return false
  const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
  return !!admin
}

// GET - Einzelnen Lieferanten abrufen
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { id } = await params
    
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: { select: { id: true, name: true } },
        _count: { select: { orderItems: true } },
      },
    })
    
    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }
    
    return NextResponse.json(supplier)
  } catch (error) {
    console.error("Failed to fetch supplier:", error)
    return NextResponse.json({ error: "Failed to fetch supplier" }, { status: 500 })
  }
}

// PUT - Lieferanten aktualisieren
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { id } = await params
    const body = await request.json()
    
    const updateData: Record<string, unknown> = {}
    
    if (body.companyName) updateData.companyName = body.companyName
    if (body.email) updateData.email = body.email
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.contactPerson !== undefined) updateData.contactPerson = body.contactPerson
    if (body.address !== undefined) updateData.address = body.address
    if (body.webhookUrl !== undefined) updateData.webhookUrl = body.webhookUrl
    if (typeof body.apiActive === "boolean") updateData.apiActive = body.apiActive
    if (typeof body.portalActive === "boolean") updateData.portalActive = body.portalActive
    if (typeof body.isActive === "boolean") updateData.isActive = body.isActive
    if (body.portalUsername !== undefined) updateData.portalUsername = body.portalUsername
    
    // Neues Portal-Passwort setzen
    if (body.portalPassword) {
      updateData.portalPassword = await bcrypt.hash(body.portalPassword, 10)
    }
    
    // Neuen API-Key generieren
    if (body.regenerateApiKey) {
      updateData.apiKey = crypto.randomBytes(32).toString("hex")
    }
    
    const supplier = await prisma.supplier.update({
      where: { id },
      data: updateData,
    })
    
    return NextResponse.json(supplier)
  } catch (error) {
    console.error("Failed to update supplier:", error)
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 })
  }
}

// DELETE - Lieferanten deaktivieren
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { id } = await params
    
    // Soft delete - nur deaktivieren
    await prisma.supplier.update({
      where: { id },
      data: { isActive: false, apiActive: false, portalActive: false },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete supplier:", error)
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
// @ts-ignore - bcrypt types
import bcrypt from "bcrypt"
import crypto from "crypto"

async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin-session")
  if (!adminSession) return false
  const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
  return !!admin
}

// GET - Alle Lieferanten abrufen
export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const suppliers = await prisma.supplier.findMany({
      orderBy: { companyName: "asc" },
      select: {
        id: true,
        companyName: true,
        email: true,
        phone: true,
        contactPerson: true,
        address: true,
        apiActive: true,
        apiKey: true,
        webhookUrl: true,
        portalActive: true,
        portalUsername: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { products: true, orderItems: true },
        },
      },
    })
    
    return NextResponse.json(suppliers)
  } catch (error) {
    console.error("Failed to fetch suppliers:", error)
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

// POST - Neuen Lieferanten anlegen
export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    
    if (!body.companyName || !body.email) {
      return NextResponse.json({ error: "Company name and email required" }, { status: 400 })
    }
    
    // Prüfe ob E-Mail bereits existiert
    const existing = await prisma.supplier.findUnique({ where: { email: body.email } })
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    
    // Generiere API-Key falls gewünscht
    const apiKey = body.apiActive ? crypto.randomBytes(32).toString("hex") : null
    
    // Hash Portal-Passwort falls angegeben
    const portalPassword = body.portalPassword 
      ? await bcrypt.hash(body.portalPassword, 10) 
      : null
    
    const supplier = await prisma.supplier.create({
      data: {
        companyName: body.companyName,
        email: body.email,
        phone: body.phone || null,
        contactPerson: body.contactPerson || null,
        address: body.address || null,
        apiActive: body.apiActive || false,
        apiKey,
        webhookUrl: body.webhookUrl || null,
        portalActive: body.portalActive ?? true,
        portalUsername: body.portalUsername || null,
        portalPassword,
        isActive: true,
      },
    })
    
    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error("Failed to create supplier:", error)
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
  }
}

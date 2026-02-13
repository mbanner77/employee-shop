import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

async function getAuthenticatedEmployee() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("employee_session")
  if (!sessionCookie) return null
  
  const employee = await prisma.employee.findUnique({
    where: { id: sessionCookie.value },
    select: { id: true, isActive: true },
  })
  
  return employee?.isActive ? employee : null
}

// GET - Alle Adressen des Mitarbeiters abrufen
export async function GET() {
  try {
    const employee = await getAuthenticatedEmployee()
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const addresses = await prisma.employeeAddress.findMany({
      where: { employeeId: employee.id, isActive: true },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    })
    
    return NextResponse.json(addresses)
  } catch (error) {
    console.error("Failed to fetch addresses:", error)
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
  }
}

// POST - Neue Adresse anlegen
export async function POST(request: Request) {
  try {
    const employee = await getAuthenticatedEmployee()
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    
    if (!body.street || !body.zip || !body.city) {
      return NextResponse.json({ error: "Street, zip and city required" }, { status: 400 })
    }
    
    // Wenn diese Adresse Standard sein soll, setze alle anderen auf nicht-Standard
    if (body.isDefault) {
      await prisma.employeeAddress.updateMany({
        where: { employeeId: employee.id },
        data: { isDefault: false },
      })
    }
    
    // Prüfe ob dies die erste Adresse ist - dann automatisch Standard
    const existingAddresses = await prisma.employeeAddress.count({
      where: { employeeId: employee.id, isActive: true },
    })
    
    const address = await prisma.employeeAddress.create({
      data: {
        employeeId: employee.id,
        type: body.type || "PRIVATE",
        label: body.label || null,
        street: body.street,
        zip: body.zip,
        city: body.city,
        country: body.country || "Deutschland",
        isDefault: body.isDefault || existingAddresses === 0,
      },
    })
    
    return NextResponse.json(address, { status: 201 })
  } catch (error) {
    console.error("Failed to create address:", error)
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 })
  }
}

// PUT - Adresse aktualisieren
export async function PUT(request: Request) {
  try {
    const employee = await getAuthenticatedEmployee()
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 })
    }
    
    // Prüfe ob Adresse dem Mitarbeiter gehört
    const existing = await prisma.employeeAddress.findFirst({
      where: { id: body.id, employeeId: employee.id },
    })
    
    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }
    
    // Wenn diese Adresse Standard werden soll
    if (body.isDefault && !existing.isDefault) {
      await prisma.employeeAddress.updateMany({
        where: { employeeId: employee.id, id: { not: body.id } },
        data: { isDefault: false },
      })
    }
    
    const address = await prisma.employeeAddress.update({
      where: { id: body.id },
      data: {
        type: body.type,
        label: body.label,
        street: body.street,
        zip: body.zip,
        city: body.city,
        country: body.country,
        isDefault: body.isDefault,
      },
    })
    
    return NextResponse.json(address)
  } catch (error) {
    console.error("Failed to update address:", error)
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
  }
}

// DELETE - Adresse löschen (soft delete)
export async function DELETE(request: Request) {
  try {
    const employee = await getAuthenticatedEmployee()
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 })
    }
    
    // Prüfe ob Adresse dem Mitarbeiter gehört
    const existing = await prisma.employeeAddress.findFirst({
      where: { id, employeeId: employee.id },
    })
    
    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }
    
    // Soft delete
    await prisma.employeeAddress.update({
      where: { id },
      data: { isActive: false, isDefault: false },
    })
    
    // Falls dies die Standard-Adresse war, setze eine andere als Standard
    if (existing.isDefault) {
      const nextDefault = await prisma.employeeAddress.findFirst({
        where: { employeeId: employee.id, isActive: true },
        orderBy: { createdAt: "desc" },
      })
      
      if (nextDefault) {
        await prisma.employeeAddress.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete address:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}

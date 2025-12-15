import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Liste aller aktiven Firmenbereiche (für Registrierung)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get("all") === "true"
    
    const companyAreas = await prisma.companyArea.findMany({
      where: all ? {} : { isActive: true },
      orderBy: [
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    })
    
    return NextResponse.json(companyAreas)
  } catch (error) {
    console.error("Failed to fetch company areas:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Firmenbereiche" }, { status: 500 })
  }
}

// POST - Neuen Firmenbereich erstellen (Admin)
export async function POST(request: Request) {
  try {
    const { name, isActive = true, sortOrder = 0 } = await request.json()
    
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 })
    }
    
    const existing = await prisma.companyArea.findUnique({
      where: { name: name.trim() },
    })
    
    if (existing) {
      return NextResponse.json({ error: "Firmenbereich existiert bereits" }, { status: 400 })
    }
    
    const companyArea = await prisma.companyArea.create({
      data: {
        name: name.trim(),
        isActive,
        sortOrder,
      },
    })
    
    return NextResponse.json(companyArea)
  } catch (error) {
    console.error("Failed to create company area:", error)
    return NextResponse.json({ error: "Fehler beim Erstellen des Firmenbereichs" }, { status: 500 })
  }
}

// PUT - Firmenbereich aktualisieren (Admin)
export async function PUT(request: Request) {
  try {
    const { id, name, isActive, sortOrder } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: "ID ist erforderlich" }, { status: 400 })
    }
    
    const companyArea = await prisma.companyArea.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    })
    
    return NextResponse.json(companyArea)
  } catch (error) {
    console.error("Failed to update company area:", error)
    return NextResponse.json({ error: "Fehler beim Aktualisieren des Firmenbereichs" }, { status: 500 })
  }
}

// DELETE - Firmenbereich löschen (Admin)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "ID ist erforderlich" }, { status: 400 })
    }
    
    await prisma.companyArea.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete company area:", error)
    return NextResponse.json({ error: "Fehler beim Löschen des Firmenbereichs" }, { status: 500 })
  }
}

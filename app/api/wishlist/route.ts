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

// GET - Wunschliste abrufen
export async function GET() {
  try {
    const employee = await getAuthenticatedEmployee()
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const items = await prisma.wishlistItem.findMany({
      where: { employeeId: employee.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameDe: true,
            nameEn: true,
            image: true,
            sizes: true,
            colors: true,
            color: true,
            stock: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    
    return NextResponse.json(items)
  } catch (error) {
    console.error("Failed to fetch wishlist:", error)
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 })
  }
}

// POST - Artikel zur Wunschliste hinzufügen
export async function POST(request: Request) {
  try {
    const employee = await getAuthenticatedEmployee()
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    
    if (!body.productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }
    
    // Prüfe ob Produkt existiert
    const product = await prisma.product.findUnique({
      where: { id: body.productId },
    })
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    
    // Upsert - aktualisiere falls bereits vorhanden
    const item = await prisma.wishlistItem.upsert({
      where: {
        employeeId_productId: {
          employeeId: employee.id,
          productId: body.productId,
        },
      },
      update: {
        preferredSize: body.preferredSize || null,
        preferredColor: body.preferredColor || null,
        notes: body.notes || null,
        notifyWhenAvailable: body.notifyWhenAvailable || false,
      },
      create: {
        employeeId: employee.id,
        productId: body.productId,
        preferredSize: body.preferredSize || null,
        preferredColor: body.preferredColor || null,
        notes: body.notes || null,
        notifyWhenAvailable: body.notifyWhenAvailable || false,
      },
      include: {
        product: true,
      },
    })
    
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error("Failed to add to wishlist:", error)
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 })
  }
}

// PUT - Wunschlisten-Eintrag aktualisieren
export async function PUT(request: Request) {
  try {
    const employee = await getAuthenticatedEmployee()
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    
    if (!body.id) {
      return NextResponse.json({ error: "Wishlist item ID required" }, { status: 400 })
    }
    
    // Prüfe ob Eintrag dem Mitarbeiter gehört
    const existing = await prisma.wishlistItem.findFirst({
      where: { id: body.id, employeeId: employee.id },
    })
    
    if (!existing) {
      return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 })
    }
    
    const item = await prisma.wishlistItem.update({
      where: { id: body.id },
      data: {
        preferredSize: body.preferredSize,
        preferredColor: body.preferredColor,
        notes: body.notes,
        notifyWhenAvailable: body.notifyWhenAvailable,
      },
      include: {
        product: true,
      },
    })
    
    return NextResponse.json(item)
  } catch (error) {
    console.error("Failed to update wishlist item:", error)
    return NextResponse.json({ error: "Failed to update wishlist item" }, { status: 500 })
  }
}

// DELETE - Artikel von Wunschliste entfernen
export async function DELETE(request: Request) {
  try {
    const employee = await getAuthenticatedEmployee()
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const id = searchParams.get("id")
    
    if (!productId && !id) {
      return NextResponse.json({ error: "Product ID or item ID required" }, { status: 400 })
    }
    
    if (id) {
      await prisma.wishlistItem.deleteMany({
        where: { id, employeeId: employee.id },
      })
    } else if (productId) {
      await prisma.wishlistItem.deleteMany({
        where: { productId, employeeId: employee.id },
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove from wishlist:", error)
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 })
  }
}

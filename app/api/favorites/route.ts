import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

async function getEmployeeId(): Promise<string | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("employee-session")
  if (!session) return null
  
  const employee = await prisma.employee.findUnique({ 
    where: { id: session.value },
    select: { id: true }
  })
  return employee?.id || null
}

// GET all favorites for current employee
export async function GET() {
  try {
    const employeeId = await getEmployeeId()
    if (!employeeId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { employeeId },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error("Failed to fetch favorites:", error)
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 })
  }
}

// POST add product to favorites
export async function POST(request: Request) {
  try {
    const employeeId = await getEmployeeId()
    if (!employeeId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        employeeId_productId: { employeeId, productId }
      }
    })

    if (existing) {
      return NextResponse.json({ error: "Already in favorites" }, { status: 400 })
    }

    const favorite = await prisma.favorite.create({
      data: {
        employeeId,
        productId,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json(favorite, { status: 201 })
  } catch (error) {
    console.error("Failed to add favorite:", error)
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 })
  }
}

// DELETE remove product from favorites
export async function DELETE(request: Request) {
  try {
    const employeeId = await getEmployeeId()
    if (!employeeId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    await prisma.favorite.delete({
      where: {
        employeeId_productId: { employeeId, productId }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove favorite:", error)
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 })
  }
}

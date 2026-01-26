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

// GET reviews for a product (public reviews only, unless admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    const reviews = await prisma.review.findMany({
      where: { 
        productId,
        isPublic: true,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate average rating
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0

    return NextResponse.json({
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    })
  } catch (error) {
    console.error("Failed to fetch reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

// POST create or update review
export async function POST(request: Request) {
  try {
    const employeeId = await getEmployeeId()
    if (!employeeId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { productId, rating, comment } = body

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Bewertung muss zwischen 1 und 5 sein" }, { status: 400 })
    }

    // Upsert review (create or update)
    const review = await prisma.review.upsert({
      where: {
        employeeId_productId: { employeeId, productId }
      },
      update: {
        rating: parseInt(rating),
        comment: comment?.trim() || null,
      },
      create: {
        employeeId,
        productId,
        rating: parseInt(rating),
        comment: comment?.trim() || null,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Failed to submit review:", error)
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}

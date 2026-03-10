import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const rating = Number(body.rating)

    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        rating,
        comment: String(body.comment || "").trim() || null,
        isPublic: body.isPublic !== false,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            articleNumber: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Failed to update CRM review:", error)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    await prisma.review.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete CRM review:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}

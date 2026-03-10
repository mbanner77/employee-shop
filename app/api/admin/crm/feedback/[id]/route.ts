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
    const message = String(body.message || "").trim()
    const rating = body.rating === null || body.rating === undefined || body.rating === "" ? null : Number(body.rating)

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 })
    }

    if (rating !== null && (Number.isNaN(rating) || rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: {
        message,
        rating,
      },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Failed to update CRM feedback:", error)
    return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 })
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
    await prisma.feedback.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete CRM feedback:", error)
    return NextResponse.json({ error: "Failed to delete feedback" }, { status: 500 })
  }
}

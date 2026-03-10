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

    const wishlistItem = await prisma.wishlistItem.update({
      where: { id },
      data: {
        preferredSize: body.preferredSize ? String(body.preferredSize).trim() : null,
        preferredColor: body.preferredColor ? String(body.preferredColor).trim() : null,
        notes: body.notes ? String(body.notes).trim() : null,
        notifyWhenAvailable: body.notifyWhenAvailable === true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            articleNumber: true,
            image: true,
            isActive: true,
          },
        },
      },
    })

    return NextResponse.json(wishlistItem)
  } catch (error) {
    console.error("Failed to update CRM wishlist item:", error)
    return NextResponse.json({ error: "Failed to update wishlist item" }, { status: 500 })
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
    await prisma.wishlistItem.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete CRM wishlist item:", error)
    return NextResponse.json({ error: "Failed to delete wishlist item" }, { status: 500 })
  }
}

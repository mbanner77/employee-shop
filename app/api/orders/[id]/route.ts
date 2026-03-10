import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendOrderStatusChangedEmail, sendReviewRequestEmail } from "@/lib/email"
import { cookies } from "next/headers"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin-session")

    if (!adminSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
    if (!admin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (error) {
    console.error("Failed to fetch order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin-session")

    if (!adminSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
    if (!admin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true, employeeId: true },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const oldStatus = existingOrder.status

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: body.status,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    try {
      if (existingOrder.employeeId && oldStatus !== order.status) {
        await sendOrderStatusChangedEmail({
          employeeId: existingOrder.employeeId,
          orderId: order.id,
          oldStatus,
          newStatus: order.status,
        })

        if (oldStatus !== "DELIVERED" && order.status === "DELIVERED") {
          await sendReviewRequestEmail({
            employeeId: existingOrder.employeeId,
            orderId: order.id,
          })
        }
      }
    } catch (error) {
      console.error("Failed to send order status changed email:", error)
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Failed to update order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin-session")

    if (!adminSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
    if (!admin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    await prisma.order.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete order:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}

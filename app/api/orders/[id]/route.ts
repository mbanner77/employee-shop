import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendOrderStatusChangedEmail } from "@/lib/email"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("employee_session")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
    }

    const { id: orderId } = await params

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Bestellung nicht gefunden" }, { status: 404 })
    }

    if (order.employeeId !== sessionId) {
      return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 })
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Nur ausstehende Bestellungen können storniert werden" },
        { status: 400 }
      )
    }

    // 30-Minuten-Frist prüfen
    const minutesSinceOrder = (Date.now() - new Date(order.createdAt).getTime()) / 1000 / 60
    if (minutesSinceOrder > 30) {
      return NextResponse.json(
        { error: "Die Stornierungsfrist von 30 Minuten ist abgelaufen" },
        { status: 400 }
      )
    }

    // Restore stock for each item
    for (const item of order.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (product && product.stock && typeof product.stock === "object") {
        const stock = product.stock as Record<string, number>
        if (item.size in stock) {
          stock[item.size] = (stock[item.size] || 0) + item.quantity
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock },
          })
        }
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Cancel order error:", error)
    return NextResponse.json({ error: "Stornierung fehlgeschlagen" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("employee_session")
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const employee = await prisma.employee.findUnique({
      where: { id: sessionCookie.value },
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const orders = await prisma.order.findMany({
      where: { employeeId: employee.id },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        customerName: true,
        street: true,
        zip: true,
        city: true,
        country: true,
        trackingNumber: true,
        trackingUrl: true,
        orderType: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const settings = await prisma.settings.findUnique({ where: { id: "settings" } })
    const maxItemsPerOrder = settings?.maxItemsPerOrder ?? 4

    // Calculate quota stats based on quotaResetDate or current year
    const quotaStartDate = employee.quotaResetDate 
      ? new Date(employee.quotaResetDate)
      : new Date(new Date().getFullYear(), 0, 1) // Default: Start of current year
    
    const quotaOrders = orders.filter((order: { createdAt: Date }) => 
      new Date(order.createdAt) >= quotaStartDate
    )
    const yearlyItemCount = quotaOrders.reduce((sum: number, order: { items: unknown[] }) => 
      sum + order.items.length, 0
    )

    return NextResponse.json({
      orders,
      stats: {
        totalOrders: orders.length,
        yearlyOrders: quotaOrders.length,
        yearlyItemCount,
        remainingItems: Math.max(0, maxItemsPerOrder - yearlyItemCount),
      },
    })
  } catch (error) {
    console.error("Failed to fetch employee orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

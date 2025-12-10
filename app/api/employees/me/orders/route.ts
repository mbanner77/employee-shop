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
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate yearly stats
    const currentYear = new Date().getFullYear()
    const thisYearOrders = orders.filter((order: { createdAt: Date }) => 
      new Date(order.createdAt).getFullYear() === currentYear
    )
    const yearlyItemCount = thisYearOrders.reduce((sum: number, order: { items: unknown[] }) => 
      sum + order.items.length, 0
    )

    return NextResponse.json({
      orders,
      stats: {
        totalOrders: orders.length,
        yearlyOrders: thisYearOrders.length,
        yearlyItemCount,
        remainingItems: Math.max(0, 4 - yearlyItemCount),
      },
    })
  } catch (error) {
    console.error("Failed to fetch employee orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())
    
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31, 23, 59, 59)

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        employee: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Flatten orders to report format
    const reports = orders.flatMap((order) =>
      order.items.map((item) => ({
        orderId: order.id,
        orderDate: order.createdAt.toISOString(),
        employeeId: order.employee?.employeeId || "-",
        employeeName: order.employee 
          ? `${order.employee.firstName} ${order.employee.lastName}` 
          : order.customerName,
        employeeEmail: order.employee?.email || order.email,
        department: order.department,
        productName: item.product.name,
        productSize: item.size,
        status: order.status,
      }))
    )

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Failed to fetch employee orders report:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Auswertung" }, { status: 500 })
  }
}

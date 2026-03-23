import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin-session")
  if (!adminSession) return false
  const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
  return !!admin
}

export async function GET(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

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
      order.items.map((item) => {
        const costBearer = (item as any).costBearer === "EMPLOYEE" ? "Privat" : "Firma"
        const unitPrice = (item as any).unitPrice
        const quantity = (item as any).quantity || 1
        const amount = (item as any).costBearer === "EMPLOYEE" && unitPrice
          ? Number((Number(unitPrice) * quantity).toFixed(2))
          : null
        return {
          orderId: order.id,
          orderNumber: order.orderNumber || order.id,
          orderDate: order.createdAt.toISOString(),
          employeeId: order.employee?.employeeId || "-",
          employeeName: order.employee 
            ? `${order.employee.firstName} ${order.employee.lastName}` 
            : order.customerName,
          employeeEmail: order.employee?.email || order.email,
          department: order.department,
          productName: item.product.name,
          productSize: item.size,
          quantity,
          costBearer,
          amount,
          status: order.status,
        }
      })
    )

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Failed to fetch employee orders report:", error)
    return NextResponse.json({ error: "Fehler beim Laden der Auswertung" }, { status: 500 })
  }
}

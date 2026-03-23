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

    // Create CSV content (Excel compatible)
    const headers = [
      "Bestelldatum",
      "Bestell-ID",
      "Mitarbeiter-ID",
      "Mitarbeitername",
      "E-Mail",
      "Firmenbereich",
      "Produkt",
      "Größe",
      "Menge",
      "Kostenträger",
      "Betrag (€)",
      "Status",
    ]

    const rows = orders.flatMap((order) =>
      order.items.map((item) => {
        const costBearer = (item as any).costBearer === "EMPLOYEE" ? "Privat" : "Firma"
        const unitPrice = (item as any).unitPrice
        const quantity = (item as any).quantity || 1
        const amount = (item as any).costBearer === "EMPLOYEE" && unitPrice
          ? (Number(unitPrice) * quantity).toFixed(2).replace(".", ",")
          : "-"
        return [
          new Date(order.createdAt).toLocaleDateString("de-DE"),
          order.orderNumber || order.id,
          order.employee?.employeeId || "-",
          order.employee 
            ? `${order.employee.firstName} ${order.employee.lastName}` 
            : order.customerName,
          order.employee?.email || order.email,
          order.department,
          item.product.name,
          item.size,
          String(quantity),
          costBearer,
          amount,
          order.status === "DELIVERED" ? "Zugestellt" :
          order.status === "SHIPPED" ? "Versendet" :
          order.status === "PROCESSING" ? "In Bearbeitung" :
          order.status === "CANCELLED" ? "Storniert" : "Ausstehend",
        ]
      })
    )

    // Build CSV with BOM for Excel UTF-8 compatibility
    const BOM = "\uFEFF"
    const csvContent = BOM + [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";")),
    ].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="mitarbeiter-bestellungen-${year}.csv"`,
      },
    })
  } catch (error) {
    console.error("Failed to export employee orders:", error)
    return NextResponse.json({ error: "Export fehlgeschlagen" }, { status: 500 })
  }
}

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
      "Status",
    ]

    const rows = orders.flatMap((order) =>
      order.items.map((item) => [
        new Date(order.createdAt).toLocaleDateString("de-DE"),
        order.id,
        order.employee?.employeeId || "-",
        order.employee 
          ? `${order.employee.firstName} ${order.employee.lastName}` 
          : order.customerName,
        order.employee?.email || order.email,
        order.department,
        item.product.name,
        item.size,
        order.status === "DELIVERED" ? "Zugestellt" :
        order.status === "SHIPPED" ? "Versendet" :
        order.status === "PROCESSING" ? "In Bearbeitung" : "Ausstehend",
      ])
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

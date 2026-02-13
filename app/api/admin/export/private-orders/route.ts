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

// GET - CSV-Export für Privatbestellungen (Buchhaltung)
export async function GET(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString())
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : null
    const format = searchParams.get("format") || "detail" // detail oder aggregiert
    
    const startDate = month 
      ? new Date(year, month - 1, 1) 
      : new Date(year, 0, 1)
    const endDate = month 
      ? new Date(year, month, 0, 23, 59, 59) 
      : new Date(year, 11, 31, 23, 59, 59)
    
    // Hole alle Privatbestellungen (costBearer = EMPLOYEE)
    const orderItems = await prisma.orderItem.findMany({
      where: {
        costBearer: "EMPLOYEE",
        order: {
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      include: {
        order: {
          include: {
            employee: true,
          },
        },
        product: true,
      },
      orderBy: { order: { createdAt: "desc" } },
    })
    
    if (format === "aggregiert") {
      // Aggregierte Ansicht pro Mitarbeiter
      const employeeMap = new Map<string, {
        personalNr: string
        name: string
        email: string
        orderCount: number
        totalAmount: number
        items: number
        paymentStatus: string
      }>()
      
      for (const item of orderItems) {
        const emp = item.order.employee
        if (!emp) continue
        
        const key = emp.employeeId
        const existing = employeeMap.get(key) || {
          personalNr: emp.employeeId,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          orderCount: 0,
          totalAmount: 0,
          items: 0,
          paymentStatus: "offen",
        }
        
        existing.items += item.quantity
        const price = item.unitPrice ? Number(item.unitPrice) : 0
        existing.totalAmount += price * item.quantity
        
        // Zähle eindeutige Bestellungen
        if (!employeeMap.has(key)) {
          existing.orderCount = 1
        }
        
        employeeMap.set(key, existing)
      }
      
      const headers = [
        "Personal-Nr",
        "Name",
        "E-Mail",
        "Anzahl Bestellungen",
        "Summe Privatartikel (€)",
        "Anzahl Artikel",
        "Zahlungsstatus",
      ]
      
      const rows = Array.from(employeeMap.values()).map(e => [
        e.personalNr,
        e.name,
        e.email,
        e.orderCount,
        e.totalAmount.toFixed(2),
        e.items,
        e.paymentStatus,
      ])
      
      const BOM = "\uFEFF"
      const csvContent = BOM + [
        headers.join(";"),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";")),
      ].join("\n")
      
      const filename = month 
        ? `privatbestellungen-aggregiert-${year}-${String(month).padStart(2, "0")}.csv`
        : `privatbestellungen-aggregiert-${year}.csv`
      
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    }
    
    // Detail-Ansicht
    const headers = [
      "Bestellnummer",
      "Bestelldatum",
      "Mitarbeiter",
      "Personal-Nr",
      "E-Mail",
      "Artikel",
      "Größe",
      "Farbe",
      "Menge",
      "Einzelpreis (€)",
      "Gesamtpreis (€)",
      "Adresse",
      "Status",
      "Zahlungsstatus",
    ]
    
    const rows = orderItems.map(item => {
      const price = item.unitPrice ? Number(item.unitPrice) : 0
      return [
        item.order.orderNumber || item.order.id,
        new Date(item.order.createdAt).toLocaleDateString("de-DE"),
        item.order.employee 
          ? `${item.order.employee.firstName} ${item.order.employee.lastName}`
          : item.order.customerName,
        item.order.employee?.employeeId || "-",
        item.order.employee?.email || item.order.email,
        item.product.name,
        item.size,
        item.color || "-",
        item.quantity,
        price.toFixed(2),
        (price * item.quantity).toFixed(2),
        `${item.order.street}, ${item.order.zip} ${item.order.city}`,
        item.order.status === "DELIVERED" ? "Zugestellt" :
        item.order.status === "SHIPPED" ? "Versendet" :
        item.order.status === "PROCESSING" ? "In Bearbeitung" : "Ausstehend",
        item.order.privatePaymentStatus === "PAID" ? "Bezahlt" :
        item.order.privatePaymentStatus === "CANCELLED" ? "Storniert" : "Offen",
      ]
    })
    
    const BOM = "\uFEFF"
    const csvContent = BOM + [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";")),
    ].join("\n")
    
    const filename = month 
      ? `privatbestellungen-detail-${year}-${String(month).padStart(2, "0")}.csv`
      : `privatbestellungen-detail-${year}.csv`
    
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Failed to export private orders:", error)
    return NextResponse.json({ error: "Export failed" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getAuthenticatedSupplier } from "@/lib/supplier-auth"
import { getSupplierOrderNote } from "@/lib/supplier-order-notes"

// Lieferanten-API: Bestellungen abrufen (mit API-Key Authentifizierung)
export async function GET(request: Request) {
  try {
    const supplier = await getAuthenticatedSupplier()

    if (!supplier) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const onlyNew = searchParams.get("new") === "true"

    const orderItems = await prisma.orderItem.findMany({
      where: {
        supplierId: supplier.id,
        ...(status && { itemStatus: status as any }),
        ...(onlyNew && { itemStatus: "PENDING" }),
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            email: true,
            street: true,
            city: true,
            zip: true,
            country: true,
            department: true,
            status: true,
            createdAt: true,
            language: true,
            supplierNotes: true,
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeId: true,
              },
            },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            nameDe: true,
            nameEn: true,
            articleNumber: true,
          },
        },
      },
      orderBy: { order: { createdAt: "desc" } },
    })

    const orderMap = new Map<string, any>()
    for (const item of orderItems) {
      const orderId = item.order.id
      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          ...item.order,
          supplierNotes: getSupplierOrderNote(item.order.supplierNotes, supplier.id),
          items: [],
        })
      }
      orderMap.get(orderId).items.push({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        articleNumber: item.product.articleNumber,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        status: item.itemStatus,
      })
    }

    return NextResponse.json({
      supplier: supplier.companyName,
      orders: Array.from(orderMap.values()),
    })
  } catch (error) {
    console.error("Supplier API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

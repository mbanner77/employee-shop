import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

// Lieferanten-API: Bestellungen abrufen (mit API-Key Authentifizierung)
export async function GET(request: Request) {
  try {
    const headersList = await headers()
    const authHeader = headersList.get("authorization")
    
    // API-Key Authentifizierung
    if (authHeader?.startsWith("Bearer ")) {
      const apiKey = authHeader.substring(7)
      
      const supplier = await prisma.supplier.findUnique({
        where: { apiKey },
        select: { id: true, companyName: true, apiActive: true, isActive: true },
      })
      
      if (!supplier || !supplier.apiActive || !supplier.isActive) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
      }
      
      // Bestellungen für diesen Lieferanten abrufen
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
              street: true,
              city: true,
              zip: true,
              country: true,
              department: true,
              status: true,
              createdAt: true,
              language: true,
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
      
      // Gruppiere nach Bestellung
      const orderMap = new Map<string, any>()
      for (const item of orderItems) {
        const orderId = item.order.id
        if (!orderMap.has(orderId)) {
          orderMap.set(orderId, {
            ...item.order,
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
    }
    
    return NextResponse.json({ error: "Authorization required" }, { status: 401 })
  } catch (error) {
    console.error("Supplier API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

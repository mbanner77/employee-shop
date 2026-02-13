import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"

// Authentifiziere Lieferanten via API-Key
async function authenticateSupplier() {
  const headersList = await headers()
  const authHeader = headersList.get("authorization")
  
  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }
  
  const apiKey = authHeader.substring(7)
  const supplier = await prisma.supplier.findUnique({
    where: { apiKey },
    select: { id: true, companyName: true, apiActive: true, isActive: true },
  })
  
  if (!supplier || !supplier.apiActive || !supplier.isActive) {
    return null
  }
  
  return supplier
}

// POST /api/supplier/orders/{id}/bestaetigen - Bestellung bestätigen
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supplier = await authenticateSupplier()
    if (!supplier) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { id: orderId } = await params
    const body = await request.json()
    const action = body.action || "confirm"
    
    // Prüfe ob Bestellung diesem Lieferanten gehört
    const orderItems = await prisma.orderItem.findMany({
      where: { 
        orderId,
        supplierId: supplier.id,
      },
    })
    
    if (orderItems.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    
    if (action === "confirm") {
      // Bestätigung mit optionalem Lieferdatum
      const expectedDelivery = body.expectedDelivery ? new Date(body.expectedDelivery) : null
      
      await prisma.orderItem.updateMany({
        where: { orderId, supplierId: supplier.id },
        data: { itemStatus: "PROCESSING" },
      })
      
      // Prüfe ob alle Items in Bearbeitung sind
      const allItems = await prisma.orderItem.findMany({
        where: { orderId },
        select: { itemStatus: true },
      })
      
      const allProcessing = allItems.every((i: { itemStatus: string }) => i.itemStatus === "PROCESSING" || i.itemStatus === "SHIPPED" || i.itemStatus === "DELIVERED")
      
      if (allProcessing) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "PROCESSING" },
        })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Bestellung bestätigt",
        expectedDelivery,
      })
    }
    
    if (action === "status") {
      // Status aktualisieren
      const newStatus = body.status
      if (!["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].includes(newStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      
      await prisma.orderItem.updateMany({
        where: { orderId, supplierId: supplier.id },
        data: { itemStatus: newStatus },
      })
      
      // Aktualisiere Hauptbestellung wenn alle Items gleichen Status haben
      const allItems = await prisma.orderItem.findMany({
        where: { orderId },
        select: { itemStatus: true },
      })
      
      const allSameStatus = allItems.every((i: { itemStatus: string }) => i.itemStatus === newStatus)
      if (allSameStatus) {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: newStatus },
        })
      }
      
      return NextResponse.json({ success: true, status: newStatus })
    }
    
    if (action === "tracking") {
      // Tracking-Nummer hinzufügen
      const { trackingNumber, trackingUrl } = body
      
      if (!trackingNumber) {
        return NextResponse.json({ error: "Tracking number required" }, { status: 400 })
      }
      
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          trackingNumber,
          trackingUrl,
          status: "SHIPPED",
        },
      })
      
      await prisma.orderItem.updateMany({
        where: { orderId, supplierId: supplier.id },
        data: { itemStatus: "SHIPPED" },
      })
      
      return NextResponse.json({ 
        success: true, 
        message: "Tracking hinzugefügt",
        trackingNumber,
      })
    }
    
    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("Supplier order action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Notizen hinzufügen
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supplier = await authenticateSupplier()
    if (!supplier) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { id: orderId } = await params
    const body = await request.json()
    
    await prisma.order.update({
      where: { id: orderId },
      data: { supplierNotes: body.notes },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Supplier notes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

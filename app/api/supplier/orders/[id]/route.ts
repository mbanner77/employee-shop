import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendOrderStatusChangedEmail, sendReviewRequestEmail } from "@/lib/email"
import { upsertSupplierOrderNote } from "@/lib/supplier-order-notes"
import { getAuthenticatedSupplier } from "@/lib/supplier-auth"

// Authentifiziere Lieferanten via API-Key
async function authenticateSupplier() {
  return getAuthenticatedSupplier()
}

function deriveOrderStatus(itemStatuses: string[]) {
  if (itemStatuses.length === 0) {
    return "PENDING"
  }

  if (itemStatuses.every((status) => status === "DELIVERED")) {
    return "DELIVERED"
  }

  if (itemStatuses.every((status) => status === "SHIPPED" || status === "DELIVERED")) {
    return "SHIPPED"
  }

  if (itemStatuses.some((status) => status === "PROCESSING" || status === "SHIPPED" || status === "DELIVERED")) {
    return "PROCESSING"
  }

  return "PENDING"
}

async function updateOrderState(orderId: string, oldStatus: string, employeeId: string | null, data?: { trackingNumber?: string; trackingUrl?: string | null }) {
  const allItems = await prisma.orderItem.findMany({
    where: { orderId },
    select: { itemStatus: true },
  })

  const nextStatus = deriveOrderStatus(allItems.map((item) => item.itemStatus))
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: nextStatus,
      ...(data || {}),
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  try {
    if (employeeId && oldStatus !== order.status) {
      await sendOrderStatusChangedEmail({
        employeeId,
        orderId: order.id,
        oldStatus,
        newStatus: order.status,
      })

      if (oldStatus !== "DELIVERED" && order.status === "DELIVERED") {
        await sendReviewRequestEmail({
          employeeId,
          orderId: order.id,
        })
      }
    }
  } catch (error) {
    console.error("Supplier order notification error:", error)
  }

  return order
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
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, employeeId: true },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    
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
      const order = await updateOrderState(orderId, existingOrder.status, existingOrder.employeeId)
      
      return NextResponse.json({ 
        success: true, 
        message: "Bestellung bestätigt",
        expectedDelivery,
        status: order.status,
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
      const order = await updateOrderState(orderId, existingOrder.status, existingOrder.employeeId)
      
      return NextResponse.json({ success: true, status: order.status })
    }
    
    if (action === "tracking") {
      // Tracking-Nummer hinzufügen
      const { trackingNumber, trackingUrl } = body
      
      if (!trackingNumber) {
        return NextResponse.json({ error: "Tracking number required" }, { status: 400 })
      }
      
      await prisma.orderItem.updateMany({
        where: { orderId, supplierId: supplier.id },
        data: { itemStatus: "SHIPPED" },
      })
      const order = await updateOrderState(orderId, existingOrder.status, existingOrder.employeeId, {
        trackingNumber,
        trackingUrl: trackingUrl || null,
      })
      
      return NextResponse.json({ 
        success: true, 
        message: "Tracking hinzugefügt",
        trackingNumber,
        status: order.status,
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

    const orderItems = await prisma.orderItem.findMany({
      where: {
        orderId,
        supplierId: supplier.id,
      },
      select: { id: true },
    })

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { supplierNotes: true },
    })
    
    await prisma.order.update({
      where: { id: orderId },
      data: {
        supplierNotes: upsertSupplierOrderNote(existingOrder?.supplierNotes, supplier.id, body.notes),
      },
    })
    
    return NextResponse.json({ success: true, notes: body.notes?.trim() || null })
  } catch (error) {
    console.error("Supplier notes error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

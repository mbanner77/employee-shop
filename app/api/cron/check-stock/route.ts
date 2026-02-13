import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendLowStockWarningEmail, sendWishlistAvailableEmail } from "@/lib/email"

// Cron Job: Prüft Lagerbestände und sendet Warnungen
// Kann täglich via Render Cron oder manuell aufgerufen werden
export async function POST(request: Request) {
  try {
    // Authentifizierung via CRON_SECRET
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const results = {
      lowStockWarnings: 0,
      wishlistNotifications: 0,
    }

    // 1. Mindestbestand-Prüfung
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        nameDe: true,
        nameEn: true,
        articleNumber: true,
        stock: true,
        minStock: true,
        sizes: true,
      },
    })

    const lowStockProducts: Array<{
      name: string
      articleNumber?: string
      currentStock: number
      minStock: number
      size?: string
    }> = []

    for (const product of products) {
      const minStock = product.minStock || 5
      const stockData = product.stock as Record<string, number> | null

      if (stockData) {
        // Prüfe Bestand pro Größe
        for (const [size, quantity] of Object.entries(stockData)) {
          if (quantity < minStock) {
            lowStockProducts.push({
              name: product.nameDe || product.name,
              articleNumber: product.articleNumber || undefined,
              currentStock: quantity,
              minStock,
              size,
            })
          }
        }
      }
    }

    if (lowStockProducts.length > 0) {
      await sendLowStockWarningEmail({ products: lowStockProducts })
      results.lowStockWarnings = lowStockProducts.length
    }

    // 2. Wunschliste Verfügbarkeits-Check
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        notifyWhenAvailable: true,
        notifiedAt: null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            nameDe: true,
            nameEn: true,
            stock: true,
            isActive: true,
          },
        },
        employee: {
          select: {
            id: true,
            notifyWishlistAvailable: true,
          },
        },
      },
    })

    for (const item of wishlistItems) {
      if (!item.product.isActive || !item.employee.notifyWishlistAvailable) continue

      const stockData = item.product.stock as Record<string, number> | null
      if (!stockData) continue

      // Prüfe ob gewünschte Größe/Farbe verfügbar
      let isAvailable = false
      let availableSize = item.preferredSize || undefined
      
      if (item.preferredSize && stockData[item.preferredSize] > 0) {
        isAvailable = true
      } else {
        // Prüfe ob irgendeine Größe verfügbar ist
        for (const [size, qty] of Object.entries(stockData)) {
          if (qty > 0) {
            isAvailable = true
            availableSize = size
            break
          }
        }
      }

      if (isAvailable) {
        await sendWishlistAvailableEmail({
          employeeId: item.employeeId,
          productId: item.productId,
          productName: item.product.nameDe || item.product.name,
          productNameEn: item.product.nameEn,
          availableSize,
          availableColor: item.preferredColor || undefined,
        })
        results.wishlistNotifications++
      }
    }

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Stock check cron error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET für manuelle Abfrage des Status
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        stock: true,
        minStock: true,
      },
    })

    let lowStockCount = 0
    const lowStockItems: Array<{ name: string; size: string; current: number; min: number }> = []

    for (const product of products) {
      const minStock = product.minStock || 5
      const stockData = product.stock as Record<string, number> | null

      if (stockData) {
        for (const [size, quantity] of Object.entries(stockData)) {
          if (quantity < minStock) {
            lowStockCount++
            lowStockItems.push({
              name: product.name,
              size,
              current: quantity,
              min: minStock,
            })
          }
        }
      }
    }

    const pendingNotifications = await prisma.wishlistItem.count({
      where: {
        notifyWhenAvailable: true,
        notifiedAt: null,
      },
    })

    return NextResponse.json({
      lowStockCount,
      lowStockItems: lowStockItems.slice(0, 10), // Nur erste 10
      pendingWishlistNotifications: pendingNotifications,
    })
  } catch (error) {
    console.error("Stock status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

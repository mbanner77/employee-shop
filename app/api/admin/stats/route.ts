import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const [
      totalOrders,
      totalProducts,
      pendingOrders,
      ordersByDepartment,
      ordersByCategory,
      ordersBySize,
      totalEmployees,
      ordersByStatus,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.groupBy({
        by: ["department"],
        _count: { id: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _count: { id: true },
      }),
      prisma.orderItem.groupBy({
        by: ["size"],
        _count: { id: true },
      }),
      prisma.employee.count(),
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ])

    // Get product details for category grouping
    const products = await prisma.product.findMany({
      select: { id: true, category: true },
    })

    const productMap = new Map(products.map((p: { id: string; category: string }) => [p.id, p.category]))

    // Calculate total items ordered
    const totalItems = await prisma.orderItem.count()

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerName: true,
        status: true,
        createdAt: true,
        department: true,
        items: { select: { id: true } },
      },
    })

    // Check low stock items
    const lowStockItems: Array<{
      id: string
      name: string
      size: string
      currentStock: number
      minStock: number
    }> = []

    for (const product of products as Array<{ id: string; category: string; name?: string; stock?: Record<string, number> | null; minStock?: number | null }>) {
      const fullProduct = await prisma.product.findUnique({
        where: { id: product.id },
        select: { name: true, stock: true, minStock: true },
      })
      if (!fullProduct) continue
      
      const minStock = fullProduct.minStock || 5
      const stockData = fullProduct.stock as Record<string, number> | null
      
      if (stockData) {
        for (const [size, quantity] of Object.entries(stockData)) {
          if (quantity < minStock) {
            lowStockItems.push({
              id: product.id,
              name: fullProduct.name,
              size,
              currentStock: quantity,
              minStock,
            })
          }
        }
      }
    }

    // Group by category
    const categoryCount: Record<string, number> = {}
    for (const item of ordersByCategory as { productId: string; _count: { id: number } }[]) {
      const category = productMap.get(item.productId) || "Sonstige"
      categoryCount[category] = (categoryCount[category] || 0) + item._count.id
    }

    // Define size order for sorting
    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
    
    return NextResponse.json({
      totalOrders,
      totalProducts,
      pendingOrders,
      totalItems,
      totalEmployees,
      ordersByDepartment: ordersByDepartment.map((d: { department: string; _count: { id: number } }) => ({
        department: d.department,
        count: d._count.id,
      })),
      ordersByCategory: Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count,
      })),
      ordersBySize: (ordersBySize as { size: string; _count: { id: number } }[])
        .map((s) => ({
          size: s.size,
          count: s._count.id,
        }))
        .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)),
      ordersByStatus: (ordersByStatus as { status: string; _count: { id: number } }[]).map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      recentOrders: recentOrders.map((o: { id: string; customerName: string; status: string; createdAt: Date; department: string; items: { id: string }[] }) => ({
        id: o.id,
        customerName: o.customerName,
        status: o.status,
        createdAt: o.createdAt,
        department: o.department,
        itemCount: o.items.length,
      })),
      lowStockItems: lowStockItems.slice(0, 10), // Top 10 low stock items
      lowStockCount: lowStockItems.length,
    })
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

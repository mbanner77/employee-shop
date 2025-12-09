import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const [
      totalOrders,
      totalProducts,
      pendingOrders,
      ordersByDepartment,
      ordersByCategory,
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
    ])

    // Get product details for category grouping
    const products = await prisma.product.findMany({
      select: { id: true, category: true },
    })

    const productMap = new Map(products.map((p: { id: string; category: string }) => [p.id, p.category]))

    // Calculate total items ordered
    const totalItems = await prisma.orderItem.count()

    // Group by category
    const categoryCount: Record<string, number> = {}
    for (const item of ordersByCategory as { productId: string; _count: { id: number } }[]) {
      const category = productMap.get(item.productId) || "Sonstige"
      categoryCount[category] = (categoryCount[category] || 0) + item._count.id
    }

    return NextResponse.json({
      totalOrders,
      totalProducts,
      pendingOrders,
      totalItems,
      ordersByDepartment: ordersByDepartment.map((d: { department: string; _count: { id: number } }) => ({
        department: d.department,
        count: d._count.id,
      })),
      ordersByCategory: Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

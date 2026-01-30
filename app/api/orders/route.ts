import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendOrderCreatedEmail, sendOrderCreatedEmailToAdmin } from "@/lib/email"
import { cookies } from "next/headers"
import type { Prisma } from "@prisma/client"

function getQuotaStartDate(employee: { quotaResetDate: Date | null }) {
  return employee.quotaResetDate
    ? new Date(employee.quotaResetDate)
    : new Date(new Date().getFullYear(), 0, 1)
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin-session")
    const supplierSession = cookieStore.get("supplier-session")

    if (!adminSession && !supplierSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (adminSession) {
      const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
      if (!admin) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
      }
    }

    if (supplierSession) {
      const supplier = await prisma.supplierUser.findUnique({ where: { id: supplierSession.value } })
      if (!supplier) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
      }
    }

    const orders = await prisma.order.findMany({
      select: {
        id: true,
        customerName: true,
        email: true,
        street: true,
        city: true,
        zip: true,
        department: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            size: true,
            productId: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("employee_session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 })
    }

    const employee = await prisma.employee.findUnique({
      where: { id: sessionCookie.value },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        isActive: true,
        quotaResetDate: true,
      },
    })

    if (!employee || !employee.isActive) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const settings = await prisma.settings.findUnique({ where: { id: "settings" } })
    const maxItemsPerOrder = settings?.maxItemsPerOrder ?? 4
    const quotaStartDate = getQuotaStartDate({ quotaResetDate: employee.quotaResetDate })

    // Aggregate requested items (allow API callers to send duplicates; validate correctly)
    const requestedItems: Array<{ productId: string; size: string }> = (body.items as Array<unknown>)
      .map((i: unknown) => {
        const raw = i as { productId?: unknown; size?: unknown }
        return {
          productId: String(raw.productId || ""),
          size: String(raw.size || ""),
        }
      })
      .filter((i) => i.productId && i.size)

    if (requestedItems.length === 0) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 })
    }

    if (requestedItems.length > maxItemsPerOrder) {
      return NextResponse.json(
        { error: `Maximal ${maxItemsPerOrder} Artikel pro Bestellung erlaubt` },
        { status: 400 },
      )
    }

    const productIds = Array.from(new Set(requestedItems.map((i) => i.productId)))
    type ProductForOrder = {
      id: string
      name: string
      sizes: string[]
      yearlyLimit: number
      stock: Prisma.JsonValue | null
    }

    const products = (await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        sizes: true,
        yearlyLimit: true,
        stock: true,
      },
    })) as ProductForOrder[]

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Unknown product in order" }, { status: 400 })
    }

    const productById = new Map<string, ProductForOrder>(products.map((p) => [p.id, p]))

    // Validate size is valid for the product
    for (const item of requestedItems) {
      const p = productById.get(item.productId)
      if (!p) {
        return NextResponse.json({ error: "Unknown product in order" }, { status: 400 })
      }
      if (!p.sizes.includes(item.size)) {
        return NextResponse.json(
          { error: `Ungültige Größe für Produkt ${p.name}` },
          { status: 400 },
        )
      }
    }

    // Global yearly limit validation (count items since quotaStartDate)
    const yearlyItemCount = await prisma.orderItem.count({
      where: {
        order: {
          employeeId: employee.id,
          createdAt: { gte: quotaStartDate },
        },
      },
    })

    if (yearlyItemCount + requestedItems.length > maxItemsPerOrder) {
      const remaining = Math.max(0, maxItemsPerOrder - yearlyItemCount)
      return NextResponse.json(
        { error: `Jahreslimit erreicht. Noch ${remaining} Artikel verfügbar.` },
        { status: 400 },
      )
    }

    // Per-product yearly limit validation
    const yearlyItemsForProducts = await prisma.orderItem.findMany({
      where: {
        productId: { in: productIds },
        order: {
          employeeId: employee.id,
          createdAt: { gte: quotaStartDate },
        },
      },
      select: { productId: true },
    })

    const alreadyOrderedByProduct = new Map<string, number>()
    for (const row of yearlyItemsForProducts) {
      alreadyOrderedByProduct.set(row.productId, (alreadyOrderedByProduct.get(row.productId) || 0) + 1)
    }

    const requestedByProduct = new Map<string, number>()
    for (const item of requestedItems) {
      requestedByProduct.set(item.productId, (requestedByProduct.get(item.productId) || 0) + 1)
    }

    for (const [productId, requestedCount] of requestedByProduct.entries()) {
      const p = productById.get(productId)!
      const alreadyCount = alreadyOrderedByProduct.get(productId) || 0
      const limit = p.yearlyLimit ?? 4
      if (alreadyCount + requestedCount > limit) {
        const remaining = Math.max(0, limit - alreadyCount)
        return NextResponse.json(
          { error: `Artikellimit erreicht für "${p.name}". Noch ${remaining} verfügbar dieses Jahr.` },
          { status: 400 },
        )
      }
    }

    // Stock validation (per size) + transactional decrement
    const requestedByProductSize = new Map<string, number>()
    for (const item of requestedItems) {
      const key = `${item.productId}::${item.size}`
      requestedByProductSize.set(key, (requestedByProductSize.get(key) || 0) + 1)
    }

    type TxProduct = {
      id: string
      name: string
      stock: Prisma.JsonValue | null
    }

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Re-read products inside txn to reduce race conditions
      const txProducts = (await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, stock: true },
      })) as TxProduct[]
      const txProductById = new Map<string, TxProduct>(txProducts.map((p) => [p.id, p]))

      for (const [key, qty] of requestedByProductSize.entries()) {
        const [productId, size] = key.split("::")
        const p = txProductById.get(productId)
        if (!p) {
          throw new Error("Unknown product in order")
        }
        if (!p.stock) continue
        const stockObj = p.stock as Record<string, unknown>
        const current = typeof stockObj[size] === "number" ? (stockObj[size] as number) : null
        if (current === null) continue
        if (current < qty) {
          throw new Error(`Nicht genügend Bestand für "${p.name}" (${size}). Verfügbar: ${current}`)
        }
      }

      // Decrement stock
      for (const [key, qty] of requestedByProductSize.entries()) {
        const [productId, size] = key.split("::")
        const p = txProductById.get(productId)
        if (!p || !p.stock) continue
        const stockObj = p.stock as Record<string, unknown>
        const current = typeof stockObj[size] === "number" ? (stockObj[size] as number) : null
        if (current === null) continue
        const next = current - qty
        const nextStock = { ...stockObj, [size]: next }
        await tx.product.update({
          where: { id: productId },
          data: { stock: nextStock },
        })
      }

      return tx.order.create({
        data: {
          customerName: `${employee.firstName} ${employee.lastName}`,
          email: employee.email,
          street: body.street,
          city: body.city,
          zip: body.zip,
          department: employee.department,
          employeeId: employee.id,
          items: {
            create: requestedItems.map((item) => ({
              productId: item.productId,
              size: item.size,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      })
    })

    try {
      const items = order.items.map((item: { product: { name: string }; size: string }) => ({
        name: item.product.name,
        size: item.size,
      }))
      // E-Mail an Besteller
      if (settings?.notifyOnOrder && order.employeeId) {
        await sendOrderCreatedEmail({ 
          employeeId: order.employeeId, 
          orderId: order.id,
          items,
        })
      }
      
      // E-Mail an Admin (marketing@realcore.de)
      if (settings?.notifyOnOrder && settings?.adminEmail) {
        await sendOrderCreatedEmailToAdmin({
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: order.email,
          department: order.department,
          items,
        })
      }
    } catch (error) {
      console.error("Failed to send order created email:", error)
    }
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Failed to create order:", error)
    const message = error instanceof Error ? error.message : "Failed to create order"
    if (
      typeof message === "string" &&
      (message.startsWith("Nicht genügend Bestand") ||
        message.includes("Maximal") ||
        message.includes("Jahreslimit") ||
        message.includes("Artikellimit") ||
        message.includes("Ungültige Größe") ||
        message.includes("Unknown product"))
    ) {
      return NextResponse.json({ error: message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

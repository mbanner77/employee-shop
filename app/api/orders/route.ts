import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendOrderCreatedEmail } from "@/lib/email"
import { cookies } from "next/headers"

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
      include: {
        items: {
          include: {
            product: true,
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
    const body = await request.json()
    
    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        email: body.email,
        street: body.street,
        city: body.city,
        zip: body.zip,
        department: body.department,
        employeeId: body.employeeId || null,
        items: {
          create: body.items.map((item: { productId: string; size: string }) => ({
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

    try {
      const settings = await prisma.settings.findUnique({ where: { id: "settings" } })
      if (settings?.notifyOnOrder && order.employeeId) {
        await sendOrderCreatedEmail({ employeeId: order.employeeId, orderId: order.id })
      }
    } catch (error) {
      console.error("Failed to send order created email:", error)
    }
    
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Failed to create order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

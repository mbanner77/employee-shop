import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
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
    
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Failed to create order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

async function isAdmin() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin-session")
  if (!adminSession) return false
  const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
  return !!admin
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const normalizedName = String(body.name || "").trim()
    const normalizedDescription = String(body.description || "").trim()
    const colors = Array.isArray(body.colors)
      ? body.colors.map((color: unknown) => String(color).trim()).filter(Boolean)
      : String(body.color || "")
          .split(",")
          .map((color) => color.trim())
          .filter(Boolean)

    const product = await prisma.product.create({
      data: {
        name: normalizedName,
        nameDe: String(body.nameDe || normalizedName),
        nameEn: String(body.nameEn || normalizedName),
        category: body.category,
        description: normalizedDescription,
        descriptionDe: String(body.descriptionDe || normalizedDescription),
        descriptionEn: String(body.descriptionEn || normalizedDescription),
        image: body.image,
        images: body.images || [],
        sizes: body.sizes,
        color: String(body.color || colors[0] || ""),
        colors,
        price: body.price ?? null,
        stock: body.stock ?? null,
        minStock: body.minStock ?? 5,
        yearlyLimit: body.yearlyLimit ?? undefined,
        multipleOrdersAllowed: body.multipleOrdersAllowed ?? true,
        maxQuantityPerOrder: body.maxQuantityPerOrder ?? 2,
        sizeChart: body.sizeChart ?? null,
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Failed to create product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

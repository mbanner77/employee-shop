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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
    })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error("Failed to fetch product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const normalizedName = String(body.name || "").trim()
    const normalizedDescription = String(body.description || "").trim()
    const colors = Array.isArray(body.colors)
      ? body.colors.map((color: unknown) => String(color).trim()).filter(Boolean)
      : String(body.color || "")
          .split(",")
          .map((color) => color.trim())
          .filter(Boolean)

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: normalizedName,
        nameDe: String(body.nameDe || normalizedName),
        nameEn: String(body.nameEn || normalizedName),
        category: body.category,
        description: normalizedDescription,
        descriptionDe: String(body.descriptionDe || normalizedDescription),
        descriptionEn: String(body.descriptionEn || normalizedDescription),
        image: body.image,
        images: body.images,
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
        supplierId: body.supplierId || null,
      },
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error("Failed to update product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    await prisma.product.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isAdminRequest = searchParams.get("admin") === "1"

    // Admin gets all fields including sizeChart; public listing excludes heavy fields
    const products = isAdminRequest
      ? await prisma.product.findMany({ orderBy: { createdAt: "asc" } })
      : await prisma.product.findMany({
          where: { isActive: true },
          select: {
            id: true,
            articleNumber: true,
            name: true,
            nameDe: true,
            nameEn: true,
            category: true,
            description: true,
            descriptionDe: true,
            descriptionEn: true,
            image: true,
            images: true,
            sizes: true,
            color: true,
            colors: true,
            price: true,
            yearlyLimit: true,
            multipleOrdersAllowed: true,
            maxQuantityPerOrder: true,
            stock: true,
            minStock: true,
            nextDelivery: true,
            supplierId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            // sizeChart excluded — can contain large base64 image data
            // Include review summary to avoid N+1 calls
            reviews: {
              where: { isPublic: true },
              select: { rating: true },
            },
          },
          orderBy: { createdAt: "asc" },
        })

    // Compute review summary inline and strip raw reviews
    const result = isAdminRequest
      ? products
      : (products as (typeof products[number] & { reviews: { rating: number }[] })[]).map(
          ({ reviews: revs, ...product }) => {
            const totalReviews = revs.length
            const averageRating =
              totalReviews > 0
                ? Math.round((revs.reduce((s, r) => s + r.rating, 0) / totalReviews) * 10) / 10
                : 0
            return { ...product, reviewSummary: { averageRating, totalReviews } }
          },
        )

    return NextResponse.json(result)
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
        supplierId: body.supplierId || null,
      },
    })
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Failed to create product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

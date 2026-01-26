import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // Get all products with their reviews
    const products = await prisma.product.findMany({
      include: {
        reviews: {
          where: { isPublic: true },
          select: { rating: true },
        },
      },
    })

    // Calculate average rating for each product and filter those with reviews
    const productsWithRatings = products
      .map((product) => {
        const totalReviews = product.reviews.length
        if (totalReviews === 0) return null

        const averageRating =
          product.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews

        return {
          id: product.id,
          name: product.name,
          image: product.image,
          category: product.category,
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
        }
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.averageRating - a.averageRating || b.totalReviews - a.totalReviews)
      .slice(0, 4) // Top 4 products

    return NextResponse.json(productsWithRatings)
  } catch (error) {
    console.error("Failed to fetch top rated products:", error)
    return NextResponse.json({ error: "Failed to fetch top rated products" }, { status: 500 })
  }
}

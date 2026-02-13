import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET - Alle Kategorien abrufen (hierarchisch)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const flat = searchParams.get("flat") === "true"
    const lang = searchParams.get("lang") || "de"
    
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { nameDe: "asc" }],
      include: {
        children: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { nameDe: "asc" }],
        },
        _count: {
          select: { products: true },
        },
      },
    })
    
    if (flat) {
      // Flache Liste aller Kategorien
      const flatList = categories.map(cat => ({
        id: cat.id,
        name: lang === "en" ? cat.nameEn : cat.nameDe,
        nameDe: cat.nameDe,
        nameEn: cat.nameEn,
        slug: cat.slug,
        parentId: cat.parentId,
        productCount: cat._count.products,
      }))
      return NextResponse.json(flatList)
    }
    
    // Hierarchische Struktur - nur Haupt-Kategorien (parentId = null)
    const rootCategories = categories
      .filter(cat => !cat.parentId)
      .map(cat => ({
        id: cat.id,
        name: lang === "en" ? cat.nameEn : cat.nameDe,
        nameDe: cat.nameDe,
        nameEn: cat.nameEn,
        slug: cat.slug,
        productCount: cat._count.products,
        children: cat.children.map(child => ({
          id: child.id,
          name: lang === "en" ? child.nameEn : child.nameDe,
          nameDe: child.nameDe,
          nameEn: child.nameEn,
          slug: child.slug,
        })),
      }))
    
    return NextResponse.json(rootCategories)
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

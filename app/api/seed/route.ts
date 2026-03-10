import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import crypto from "crypto"

const defaultProducts = [
  {
    nameDe: "RealCore Premium Hoodie",
    nameEn: "RealCore Premium Hoodie",
    name: "RealCore Premium Hoodie",
    category: "Hoodies",
    descriptionDe: "Bequemer Hoodie aus Bio-Baumwolle mit gesticktem RealCore Logo",
    descriptionEn: "Comfortable organic cotton hoodie with embroidered RealCore logo",
    description: "Bequemer Hoodie aus Bio-Baumwolle mit gesticktem RealCore Logo",
    image: "/navy-blue-premium-hoodie-with-company-logo.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Navy",
    colors: ["Navy"],
  },
  {
    nameDe: "RealCore Classic T-Shirt",
    nameEn: "RealCore Classic T-Shirt",
    name: "RealCore Classic T-Shirt",
    category: "T-Shirts",
    descriptionDe: "Klassisches T-Shirt mit RealCore Branding",
    descriptionEn: "Classic t-shirt with RealCore branding",
    description: "Klassisches T-Shirt mit RealCore Branding",
    image: "/white-classic-tshirt-with-minimalist-company-logo.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Weiß",
    colors: ["Weiß"],
  },
  {
    nameDe: "RealCore Tech Polo",
    nameEn: "RealCore Tech Polo",
    name: "RealCore Tech Polo",
    category: "Polos",
    descriptionDe: "Elegantes Poloshirt für Business und Freizeit",
    descriptionEn: "Elegant polo shirt for business and leisure",
    description: "Elegantes Poloshirt für Business und Freizeit",
    image: "/dark-blue-polo-shirt-professional-style.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Dunkelblau",
    colors: ["Dunkelblau"],
  },
  {
    nameDe: "RealCore Softshell Jacke",
    nameEn: "RealCore Softshell Jacket",
    name: "RealCore Softshell Jacke",
    category: "Jacken",
    descriptionDe: "Wasserabweisende Softshell-Jacke für outdoor Aktivitäten",
    descriptionEn: "Water-repellent softshell jacket for outdoor activities",
    description: "Wasserabweisende Softshell-Jacke für outdoor Aktivitäten",
    image: "/black-softshell-jacket-modern-style.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Schwarz",
    colors: ["Schwarz"],
  },
  {
    nameDe: "RealCore Cap",
    nameEn: "RealCore Cap",
    name: "RealCore Cap",
    category: "Accessoires",
    descriptionDe: "Stylische Cap mit gesticktem Logo",
    descriptionEn: "Stylish cap with embroidered logo",
    description: "Stylische Cap mit gesticktem Logo",
    image: "/navy-baseball-cap-with-embroidered-logo.jpg",
    images: [],
    sizes: ["S", "M", "L"],
    color: "Navy",
    colors: ["Navy"],
  },
  {
    nameDe: "RealCore Fleece Pullover",
    nameEn: "RealCore Fleece Sweater",
    name: "RealCore Fleece Pullover",
    category: "Pullover",
    descriptionDe: "Kuscheliger Fleece-Pullover für kalte Tage",
    descriptionEn: "Cozy fleece sweater for cold days",
    description: "Kuscheliger Fleece-Pullover für kalte Tage",
    image: "/gray-fleece-pullover-cozy-warm.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Grau",
    colors: ["Grau"],
  },
  {
    nameDe: "RealCore Sport Shorts",
    nameEn: "RealCore Sport Shorts",
    name: "RealCore Sport Shorts",
    category: "Hosen",
    descriptionDe: "Atmungsaktive Sport-Shorts für Training und Freizeit",
    descriptionEn: "Breathable sport shorts for training and leisure",
    description: "Atmungsaktive Sport-Shorts für Training und Freizeit",
    image: "/black-athletic-shorts-sporty.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Schwarz",
    colors: ["Schwarz"],
  },
  {
    nameDe: "RealCore Beanie",
    nameEn: "RealCore Beanie",
    name: "RealCore Beanie",
    category: "Accessoires",
    descriptionDe: "Warme Strickmütze mit Logo-Patch",
    descriptionEn: "Warm knitted beanie with logo patch",
    description: "Warme Strickmütze mit Logo-Patch",
    image: "/charcoal-gray-beanie-hat-knitted.jpg",
    images: [],
    sizes: ["S", "M", "L"],
    color: "Anthrazit",
    colors: ["Anthrazit"],
  },
  {
    nameDe: "RealCore Zip Hoodie",
    nameEn: "RealCore Zip Hoodie",
    name: "RealCore Zip Hoodie",
    category: "Hoodies",
    descriptionDe: "Zip-Hoodie mit durchgehendem Reißverschluss",
    descriptionEn: "Zip hoodie with full-length zipper",
    description: "Zip-Hoodie mit durchgehendem Reißverschluss",
    image: "/heather-gray-zip-up-hoodie-modern.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Grau Meliert",
    colors: ["Grau Meliert"],
  },
  {
    nameDe: "RealCore Longsleeve",
    nameEn: "RealCore Longsleeve",
    name: "RealCore Longsleeve",
    category: "T-Shirts",
    descriptionDe: "Langarm-Shirt aus weicher Baumwolle",
    descriptionEn: "Long sleeve shirt made of soft cotton",
    description: "Langarm-Shirt aus weicher Baumwolle",
    image: "/black-long-sleeve-shirt-minimalist.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Schwarz",
    colors: ["Schwarz"],
  },
]

// GET method - allows seeding empty database without secret (for initial setup)
export async function GET() {
  try {
    const existingProducts = await prisma.product.count()
    const existingAdmin = await prisma.adminUser.count()
    const existingSupplier = await prisma.supplier.count()

    // Only allow GET seeding if database is completely empty
    if (existingProducts > 0 || existingAdmin > 0 || existingSupplier > 0) {
      return NextResponse.json({
        success: false,
        message: "Database already has data. Use POST with secret to reseed.",
        existingProducts,
        existingAdmin,
        existingSupplier,
      })
    }

    // Seed products
    await prisma.product.createMany({
      data: defaultProducts,
    })

    // Create default admin user
    await prisma.adminUser.create({
      data: {
        username: "admin",
        password: process.env.ADMIN_PASSWORD || "realcore2025",
      },
    })

    // Create default supplier user
    await prisma.supplier.create({
      data: {
        companyName: "Default Supplier",
        email: "supplier@realcore.de",
        portalActive: true,
        portalUsername: "supplier",
        portalPassword: crypto.createHash("sha256").update(process.env.SUPPLIER_PASSWORD || "supplier2025").digest("hex"),
        apiActive: false,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      productsCreated: defaultProducts.length,
      adminCreated: true,
      supplierCreated: true,
    })
  } catch (error) {
    console.error("Seeding failed:", error)
    return NextResponse.json({ error: "Seeding failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  // Check for secret key to prevent unauthorized seeding
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")
  
  if (secret !== process.env.SEED_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if already seeded
    const existingProducts = await prisma.product.count()
    const existingAdmin = await prisma.adminUser.count()
    const existingSupplier = await prisma.supplier.count()

    if (existingProducts === 0) {
      // Seed products
      await prisma.product.createMany({
        data: defaultProducts,
      })
    }

    if (existingAdmin === 0) {
      // Create default admin user
      await prisma.adminUser.create({
        data: {
          username: "admin",
          password: process.env.ADMIN_PASSWORD || "realcore2025",
        },
      })
    }

    if (existingSupplier === 0) {
      // Create default supplier user
      await prisma.supplier.create({
        data: {
          companyName: "Default Supplier",
          email: "supplier@realcore.de",
          portalActive: true,
          portalUsername: "supplier",
          portalPassword: crypto.createHash("sha256").update(process.env.SUPPLIER_PASSWORD || "supplier2025").digest("hex"),
          apiActive: false,
          isActive: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      productsCreated: existingProducts === 0 ? defaultProducts.length : 0,
      adminCreated: existingAdmin === 0,
      supplierCreated: existingSupplier === 0,
    })
  } catch (error) {
    console.error("Seeding failed:", error)
    return NextResponse.json({ error: "Seeding failed" }, { status: 500 })
  }
}

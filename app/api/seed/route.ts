import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const defaultProducts = [
  {
    name: "RealCore Premium Hoodie",
    category: "Hoodies",
    description: "Bequemer Hoodie aus Bio-Baumwolle mit gesticktem RealCore Logo",
    image: "/navy-blue-premium-hoodie-with-company-logo.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Navy",
  },
  {
    name: "RealCore Classic T-Shirt",
    category: "T-Shirts",
    description: "Klassisches T-Shirt mit RealCore Branding",
    image: "/white-classic-tshirt-with-minimalist-company-logo.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Weiß",
  },
  {
    name: "RealCore Tech Polo",
    category: "Polos",
    description: "Elegantes Poloshirt für Business und Freizeit",
    image: "/dark-blue-polo-shirt-professional-style.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Dunkelblau",
  },
  {
    name: "RealCore Softshell Jacke",
    category: "Jacken",
    description: "Wasserabweisende Softshell-Jacke für outdoor Aktivitäten",
    image: "/black-softshell-jacket-modern-style.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Schwarz",
  },
  {
    name: "RealCore Cap",
    category: "Accessoires",
    description: "Stylische Cap mit gesticktem Logo",
    image: "/navy-baseball-cap-with-embroidered-logo.jpg",
    images: [],
    sizes: ["S", "M", "L"],
    color: "Navy",
  },
  {
    name: "RealCore Fleece Pullover",
    category: "Pullover",
    description: "Kuscheliger Fleece-Pullover für kalte Tage",
    image: "/gray-fleece-pullover-cozy-warm.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Grau",
  },
  {
    name: "RealCore Sport Shorts",
    category: "Hosen",
    description: "Atmungsaktive Sport-Shorts für Training und Freizeit",
    image: "/black-athletic-shorts-sporty.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Schwarz",
  },
  {
    name: "RealCore Beanie",
    category: "Accessoires",
    description: "Warme Strickmütze mit Logo-Patch",
    image: "/charcoal-gray-beanie-hat-knitted.jpg",
    images: [],
    sizes: ["S", "M", "L"],
    color: "Anthrazit",
  },
  {
    name: "RealCore Zip Hoodie",
    category: "Hoodies",
    description: "Zip-Hoodie mit durchgehendem Reißverschluss",
    image: "/heather-gray-zip-up-hoodie-modern.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Grau Meliert",
  },
  {
    name: "RealCore Longsleeve",
    category: "T-Shirts",
    description: "Langarm-Shirt aus weicher Baumwolle",
    image: "/black-long-sleeve-shirt-minimalist.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Schwarz",
  },
]

// GET method - allows seeding empty database without secret (for initial setup)
export async function GET() {
  try {
    const existingProducts = await prisma.product.count()
    const existingAdmin = await prisma.adminUser.count()

    // Only allow GET seeding if database is completely empty
    if (existingProducts > 0 || existingAdmin > 0) {
      return NextResponse.json({
        success: false,
        message: "Database already has data. Use POST with secret to reseed.",
        existingProducts,
        existingAdmin,
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

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      productsCreated: defaultProducts.length,
      adminCreated: true,
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

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      productsCreated: existingProducts === 0 ? defaultProducts.length : 0,
      adminCreated: existingAdmin === 0,
    })
  } catch (error) {
    console.error("Seeding failed:", error)
    return NextResponse.json({ error: "Seeding failed" }, { status: 500 })
  }
}

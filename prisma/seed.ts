import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const defaultProducts = [
  {
    name: "RealCore Premium Hoodie",
    nameDe: "RealCore Premium Hoodie",
    nameEn: "RealCore Premium Hoodie",
    category: "Hoodies",
    description: "Bequemer Hoodie aus Bio-Baumwolle mit gesticktem RealCore Logo",
    descriptionDe: "Bequemer Hoodie aus Bio-Baumwolle mit gesticktem RealCore Logo",
    descriptionEn: "Comfortable hoodie made from organic cotton with embroidered RealCore logo",
    image: "/navy-blue-premium-hoodie-with-company-logo.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Navy",
    colors: ["Navy", "Schwarz", "Grau"],
    price: 49.99,
  },
  {
    name: "RealCore Classic T-Shirt",
    nameDe: "RealCore Classic T-Shirt",
    nameEn: "RealCore Classic T-Shirt",
    category: "T-Shirts",
    description: "Klassisches T-Shirt mit RealCore Branding",
    descriptionDe: "Klassisches T-Shirt mit RealCore Branding",
    descriptionEn: "Classic t-shirt with RealCore branding",
    image: "/white-classic-tshirt-with-minimalist-company-logo.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Weiß",
    colors: ["Weiß", "Schwarz", "Navy"],
    price: 24.99,
  },
  {
    name: "RealCore Tech Polo",
    nameDe: "RealCore Tech Polo",
    nameEn: "RealCore Tech Polo",
    category: "Polos",
    description: "Elegantes Poloshirt für Business und Freizeit",
    descriptionDe: "Elegantes Poloshirt für Business und Freizeit",
    descriptionEn: "Elegant polo shirt for business and leisure",
    image: "/dark-blue-polo-shirt-professional-style.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Dunkelblau",
    colors: ["Dunkelblau", "Weiß"],
    price: 39.99,
  },
  {
    name: "RealCore Softshell Jacke",
    nameDe: "RealCore Softshell Jacke",
    nameEn: "RealCore Softshell Jacket",
    category: "Jacken",
    description: "Wasserabweisende Softshell-Jacke für outdoor Aktivitäten",
    descriptionDe: "Wasserabweisende Softshell-Jacke für outdoor Aktivitäten",
    descriptionEn: "Water-repellent softshell jacket for outdoor activities",
    image: "/black-softshell-jacket-modern-style.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Schwarz",
    colors: ["Schwarz", "Navy"],
    price: 89.99,
    yearlyLimit: 1,
  },
  {
    name: "RealCore Cap",
    nameDe: "RealCore Cap",
    nameEn: "RealCore Cap",
    category: "Accessoires",
    description: "Stylische Cap mit gesticktem Logo",
    descriptionDe: "Stylische Cap mit gesticktem Logo",
    descriptionEn: "Stylish cap with embroidered logo",
    image: "/navy-baseball-cap-with-embroidered-logo.jpg",
    images: [],
    sizes: ["S", "M", "L"],
    color: "Navy",
    colors: ["Navy", "Schwarz"],
    price: 19.99,
  },
  {
    name: "RealCore Fleece Pullover",
    nameDe: "RealCore Fleece Pullover",
    nameEn: "RealCore Fleece Sweater",
    category: "Pullover",
    description: "Kuscheliger Fleece-Pullover für kalte Tage",
    descriptionDe: "Kuscheliger Fleece-Pullover für kalte Tage",
    descriptionEn: "Cozy fleece sweater for cold days",
    image: "/gray-fleece-pullover-cozy-warm.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Grau",
    colors: ["Grau", "Navy"],
    price: 59.99,
  },
  {
    name: "RealCore Sport Shorts",
    nameDe: "RealCore Sport Shorts",
    nameEn: "RealCore Sport Shorts",
    category: "Hosen",
    description: "Atmungsaktive Sport-Shorts für Training und Freizeit",
    descriptionDe: "Atmungsaktive Sport-Shorts für Training und Freizeit",
    descriptionEn: "Breathable sport shorts for training and leisure",
    image: "/black-athletic-shorts-sporty.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Schwarz",
    colors: ["Schwarz", "Grau"],
    price: 34.99,
  },
  {
    name: "RealCore Beanie",
    nameDe: "RealCore Beanie",
    nameEn: "RealCore Beanie",
    category: "Accessoires",
    description: "Warme Strickmütze mit Logo-Patch",
    descriptionDe: "Warme Strickmütze mit Logo-Patch",
    descriptionEn: "Warm knitted beanie with logo patch",
    image: "/charcoal-gray-beanie-hat-knitted.jpg",
    images: [],
    sizes: ["S", "M", "L"],
    color: "Anthrazit",
    colors: ["Anthrazit", "Schwarz"],
    price: 24.99,
  },
  {
    name: "RealCore Zip Hoodie",
    nameDe: "RealCore Zip Hoodie",
    nameEn: "RealCore Zip Hoodie",
    category: "Hoodies",
    description: "Zip-Hoodie mit durchgehendem Reißverschluss",
    descriptionDe: "Zip-Hoodie mit durchgehendem Reißverschluss",
    descriptionEn: "Zip hoodie with full-length zipper",
    image: "/heather-gray-zip-up-hoodie-modern.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Grau Meliert",
    colors: ["Grau Meliert", "Schwarz"],
    price: 54.99,
  },
  {
    name: "RealCore Longsleeve",
    nameDe: "RealCore Longsleeve",
    nameEn: "RealCore Long Sleeve",
    category: "T-Shirts",
    description: "Langarm-Shirt aus weicher Baumwolle",
    descriptionDe: "Langarm-Shirt aus weicher Baumwolle",
    descriptionEn: "Long sleeve shirt made from soft cotton",
    image: "/black-long-sleeve-shirt-minimalist.jpg",
    images: [],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    color: "Schwarz",
    colors: ["Schwarz", "Weiß"],
    price: 29.99,
  },
]

const defaultCategories = [
  { nameDe: "Hoodies", nameEn: "Hoodies", slug: "hoodies", sortOrder: 1 },
  { nameDe: "T-Shirts", nameEn: "T-Shirts", slug: "t-shirts", sortOrder: 2 },
  { nameDe: "Polos", nameEn: "Polos", slug: "polos", sortOrder: 3 },
  { nameDe: "Pullover", nameEn: "Sweaters", slug: "pullover", sortOrder: 4 },
  { nameDe: "Jacken", nameEn: "Jackets", slug: "jacken", sortOrder: 5 },
  { nameDe: "Hosen", nameEn: "Pants", slug: "hosen", sortOrder: 6 },
  { nameDe: "Accessoires", nameEn: "Accessories", slug: "accessoires", sortOrder: 7 },
]

async function main() {
  console.log("Seeding database...")

  // Check if already seeded
  const existingProducts = await prisma.product.count()
  const existingAdmin = await prisma.adminUser.count()

  // Seed Categories
  const existingCategories = await prisma.category.count()
  if (existingCategories === 0) {
    console.log("Creating categories...")
    await prisma.category.createMany({
      data: defaultCategories,
    })
    console.log(`Created ${defaultCategories.length} categories`)
  } else {
    console.log(`Categories already exist (${existingCategories} found)`)
  }

  // Seed Settings
  const existingSettings = await prisma.settings.findUnique({ where: { id: "settings" } })
  if (!existingSettings) {
    console.log("Creating default settings...")
    await prisma.settings.create({
      data: {
        id: "settings",
        shopName: "RealCore Mitarbeiter-Shop",
        maxItemsPerOrder: 4,
        adminEmail: "marketing@realcore.de",
      },
    })
    console.log("Created default settings")
  } else {
    console.log("Settings already exist")
  }

  // Seed Default Company
  const existingCompany = await prisma.company.findFirst()
  if (!existingCompany) {
    console.log("Creating default company...")
    await prisma.company.create({
      data: {
        name: "RealCore GmbH",
        billingAddress: "Musterstraße 123, 12345 Berlin",
        paymentTerms: "30 Tage netto",
      },
    })
    console.log("Created default company")
  } else {
    console.log("Company already exists")
  }

  if (existingProducts === 0) {
    console.log("Creating products...")
    // @ts-ignore - new fields may not be recognized until prisma generate
    await prisma.product.createMany({
      data: defaultProducts,
    })
    console.log(`Created ${defaultProducts.length} products`)
  } else {
    console.log(`Products already exist (${existingProducts} found)`)
  }

  if (existingAdmin === 0) {
    console.log("Creating admin user...")
    await prisma.adminUser.create({
      data: {
        username: "admin",
        password: process.env.ADMIN_PASSWORD || "realcore2025",
      },
    })
    console.log("Created admin user")
  } else {
    console.log("Admin user already exists")
  }

  // Create Supplier User for portal access
  const existingSupplier = await prisma.supplierUser.count()
  if (existingSupplier === 0) {
    console.log("Creating supplier user...")
    await prisma.supplierUser.create({
      data: {
        username: "supplier",
        password: process.env.SUPPLIER_PASSWORD || "supplier2025",
      },
    })
    console.log("Created supplier user")
  } else {
    console.log("Supplier user already exists")
  }

  // Create admin employee for frontend login
  const existingAdminEmployee = await prisma.employee.findUnique({
    where: { email: "admin@realcore.de" }
  })

  if (!existingAdminEmployee) {
    console.log("Creating admin employee for frontend...")
    // Get default company
    const defaultCompany = await prisma.company.findFirst()
    await prisma.employee.create({
      data: {
        email: "admin@realcore.de",
        password: process.env.ADMIN_PASSWORD || "realcore2025",
        employeeId: "ADMIN001",
        firstName: "Admin",
        lastName: "RealCore",
        department: "Administration",
        companyId: defaultCompany?.id,
      },
    })
    console.log("Created admin employee (admin@realcore.de)")
  } else {
    console.log("Admin employee already exists")
  }

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

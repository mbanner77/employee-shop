import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

async function isAdmin() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin-session")
  if (!adminSession) return false
  const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
  return !!admin
}

function isBase64DataUrl(str: string): boolean {
  return str.startsWith("data:image/")
}

function getExtFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/(\w+);/)
  if (!match) return "jpg"
  const type = match[1]
  if (type === "jpeg") return "jpg"
  return type
}

async function saveBase64ToFile(dataUrl: string): Promise<string> {
  const ext = getExtFromDataUrl(dataUrl)
  const uniqueName = `${crypto.randomUUID()}.${ext}`
  const filePath = path.join(UPLOAD_DIR, uniqueName)

  const base64Data = dataUrl.split(",")[1]
  if (!base64Data) throw new Error("Invalid data URL")

  const buffer = Buffer.from(base64Data, "base64")
  await writeFile(filePath, new Uint8Array(buffer))

  return `/uploads/${uniqueName}`
}

// POST - Migrate base64 images in DB to filesystem
export async function POST() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    // Load products one at a time to avoid OOM
    const productIds = await prisma.product.findMany({
      select: { id: true },
    })

    let migratedCount = 0
    let errorCount = 0

    for (const { id } of productIds) {
      try {
        const product = await prisma.product.findUnique({
          where: { id },
          select: { id: true, image: true, images: true, sizeChart: true },
        })
        if (!product) continue

        const updates: Record<string, unknown> = {}

        // Migrate main image
        if (product.image && isBase64DataUrl(product.image)) {
          updates.image = await saveBase64ToFile(product.image)
        }

        // Migrate additional images
        if (product.images && product.images.length > 0) {
          const hasBase64 = product.images.some(isBase64DataUrl)
          if (hasBase64) {
            const newImages: string[] = []
            for (const img of product.images) {
              if (isBase64DataUrl(img)) {
                newImages.push(await saveBase64ToFile(img))
              } else {
                newImages.push(img)
              }
            }
            updates.images = newImages
          }
        }

        // Migrate sizeChart
        if (product.sizeChart && isBase64DataUrl(product.sizeChart)) {
          updates.sizeChart = await saveBase64ToFile(product.sizeChart)
        }

        if (Object.keys(updates).length > 0) {
          await prisma.product.update({
            where: { id },
            data: updates,
          })
          migratedCount++
        }
      } catch (err) {
        console.error(`Failed to migrate images for product ${id}:`, err)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      totalProducts: productIds.length,
      migratedProducts: migratedCount,
      errors: errorCount,
    })
  } catch (error) {
    console.error("Image migration failed:", error)
    return NextResponse.json({ error: "Migration failed" }, { status: 500 })
  }
}

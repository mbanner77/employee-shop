import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/products/[id]/image?field=image&index=0
// Streams a single image from the DB as binary (not JSON), so it can be used as <img src>
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const field = searchParams.get("field") || "image" // "image", "images", "sizeChart"
    const index = parseInt(searchParams.get("index") || "0")

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        image: field === "image",
        images: field === "images",
        sizeChart: field === "sizeChart",
      },
    })

    if (!product) {
      return new NextResponse("Not found", { status: 404 })
    }

    let dataUrl: string | null = null

    if (field === "image") {
      dataUrl = product.image || null
    } else if (field === "images" && product.images) {
      dataUrl = product.images[index] || null
    } else if (field === "sizeChart") {
      dataUrl = product.sizeChart || null
    }

    if (!dataUrl) {
      return new NextResponse("No image", { status: 404 })
    }

    // If it's already a URL path (not base64), redirect to it
    if (!dataUrl.startsWith("data:")) {
      return NextResponse.redirect(new URL(dataUrl, request.url))
    }

    // Parse base64 data URL: data:image/jpeg;base64,/9j/4AAQ...
    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!match) {
      return new NextResponse("Invalid image data", { status: 500 })
    }

    const contentType = match[1]
    const base64Data = match[2]
    const buffer = Buffer.from(base64Data, "base64")

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Failed to serve image:", error)
    return new NextResponse("Error", { status: 500 })
  }
}

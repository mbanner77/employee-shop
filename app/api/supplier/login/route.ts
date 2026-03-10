import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    const supplier = await prisma.supplier.findUnique({
      where: { portalUsername: username },
    })

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")

    if (
      !supplier ||
      !supplier.isActive ||
      !supplier.portalActive ||
      !supplier.portalPassword ||
      supplier.portalPassword !== hashedPassword
    ) {
      return NextResponse.json({ error: "Ungültige Anmeldedaten" }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set("supplier-session", supplier.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({ success: true, username: supplier.portalUsername, companyName: supplier.companyName })
  } catch (error) {
    console.error("Supplier login failed:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}

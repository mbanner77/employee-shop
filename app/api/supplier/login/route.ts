import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    const supplier = await prisma.supplierUser.findUnique({
      where: { username },
    })

    if (!supplier || supplier.password !== password) {
      return NextResponse.json({ error: "Ungültige Anmeldedaten" }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set("supplier-session", supplier.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({ success: true, username: supplier.username })
  } catch (error) {
    console.error("Supplier login failed:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}

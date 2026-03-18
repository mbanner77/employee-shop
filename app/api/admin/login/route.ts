import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyPassword, hashPassword } from "@/lib/password"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    const admin = await prisma.adminUser.findUnique({
      where: { username },
    })

    if (!admin || !(await verifyPassword(password, admin.password))) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten" },
        { status: 401 }
      )
    }

    // Auto-migrate plaintext password to bcrypt hash
    if (!admin.password.startsWith("$2a$") && !admin.password.startsWith("$2b$")) {
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { password: await hashPassword(password) },
      })
    }

    // Set a simple session cookie
    const cookieStore = await cookies()
    cookieStore.set("admin-session", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({ success: true, username: admin.username })
  } catch (error) {
    console.error("Login failed:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}

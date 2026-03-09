import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin-session")

    if (!adminSession) {
      return NextResponse.json({ authenticated: false })
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminSession.value },
      select: {
        id: true,
        username: true,
      },
    })

    if (!admin) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      admin,
    })
  } catch (error) {
    console.error("Failed to fetch admin session:", error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}

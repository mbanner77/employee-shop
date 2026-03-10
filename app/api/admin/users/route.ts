import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

async function isAdmin() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin-session")
  if (!adminSession) return false
  const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
  return !!admin
}

// GET all supplier users
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json(
      { error: "Deprecated endpoint. Use /api/admin/suppliers for supplier access management." },
      { status: 410 },
    )
  } catch (error) {
    console.error("Failed to fetch supplier users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST create new supplier user
export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await request.json()

    return NextResponse.json(
      { error: "Deprecated endpoint. Use /api/admin/suppliers for supplier access management." },
      { status: 410 },
    )
  } catch (error) {
    console.error("Failed to create supplier user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

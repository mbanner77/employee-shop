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

// GET all admin users
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const admins = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(admins)
  } catch (error) {
    console.error("Failed to fetch admin users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST create new admin user
export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const existing = await prisma.adminUser.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    const admin = await prisma.adminUser.create({
      data: { username, password },
      select: { id: true, username: true, createdAt: true },
    })

    return NextResponse.json(admin, { status: 201 })
  } catch (error) {
    console.error("Failed to create admin user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

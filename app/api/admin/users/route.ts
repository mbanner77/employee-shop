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

    const suppliers = await prisma.supplierUser.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(suppliers)
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

    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const existing = await prisma.supplierUser.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 })
    }

    const supplier = await prisma.supplierUser.create({
      data: { username, password },
      select: { id: true, username: true, createdAt: true },
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error("Failed to create supplier user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

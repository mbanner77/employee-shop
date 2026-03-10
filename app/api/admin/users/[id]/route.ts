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

// GET single supplier user
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await params

    return NextResponse.json(
      { error: "Deprecated endpoint. Use /api/admin/suppliers for supplier access management." },
      { status: 410 },
    )
  } catch (error) {
    console.error("Failed to fetch supplier user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PATCH update supplier user
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await params
    await request.json()

    return NextResponse.json(
      { error: "Deprecated endpoint. Use /api/admin/suppliers for supplier access management." },
      { status: 410 },
    )
  } catch (error) {
    console.error("Failed to update supplier user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE supplier user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    await params

    return NextResponse.json(
      { error: "Deprecated endpoint. Use /api/admin/suppliers for supplier access management." },
      { status: 410 },
    )
  } catch (error) {
    console.error("Failed to delete supplier user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

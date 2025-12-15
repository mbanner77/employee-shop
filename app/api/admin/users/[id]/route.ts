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

    const { id } = await params
    const supplier = await prisma.supplierUser.findUnique({
      where: { id },
      select: { id: true, username: true, createdAt: true },
    })

    if (!supplier) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(supplier)
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

    const { id } = await params
    const body = await request.json()

    const updateData: { username?: string; password?: string } = {}

    if (body.username) {
      const existing = await prisma.supplierUser.findFirst({
        where: { username: body.username, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 })
      }
      updateData.username = body.username
    }

    if (body.password) {
      updateData.password = body.password
    }

    const supplier = await prisma.supplierUser.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, createdAt: true },
    })

    return NextResponse.json(supplier)
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

    const { id } = await params
    await prisma.supplierUser.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete supplier user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

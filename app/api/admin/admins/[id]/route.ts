import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

async function getCurrentAdminId() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin-session")
  if (!adminSession) return null
  const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
  return admin?.id || null
}

// GET single admin user
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentAdminId = await getCurrentAdminId()
    if (!currentAdminId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const admin = await prisma.adminUser.findUnique({
      where: { id },
      select: { id: true, username: true, createdAt: true },
    })

    if (!admin) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(admin)
  } catch (error) {
    console.error("Failed to fetch admin user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PATCH update admin user
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentAdminId = await getCurrentAdminId()
    if (!currentAdminId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { username, password } = body

    const updateData: { username?: string; password?: string } = {}
    if (username) updateData.username = username
    if (password) updateData.password = password

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No data to update" }, { status: 400 })
    }

    // Check if username already exists (for another user)
    if (username) {
      const existing = await prisma.adminUser.findFirst({
        where: { username, NOT: { id } },
      })
      if (existing) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 })
      }
    }

    const admin = await prisma.adminUser.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, createdAt: true },
    })

    return NextResponse.json(admin)
  } catch (error) {
    console.error("Failed to update admin user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE admin user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentAdminId = await getCurrentAdminId()
    if (!currentAdminId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params

    // Prevent deleting yourself
    if (id === currentAdminId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Check if this is the last admin
    const adminCount = await prisma.adminUser.count()
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin user" }, { status: 400 })
    }

    await prisma.adminUser.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete admin user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

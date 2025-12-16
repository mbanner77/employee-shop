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

// POST reset quota for employees
export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { employeeIds, resetAll } = body

    const now = new Date()

    if (resetAll) {
      // Reset quota for all employees
      const result = await prisma.employee.updateMany({
        data: { quotaResetDate: now },
      })
      return NextResponse.json({ 
        success: true, 
        message: `Kontingent für ${result.count} Mitarbeiter zurückgesetzt`,
        count: result.count 
      })
    }

    if (Array.isArray(employeeIds) && employeeIds.length > 0) {
      // Reset quota for specific employees
      const result = await prisma.employee.updateMany({
        where: { id: { in: employeeIds } },
        data: { quotaResetDate: now },
      })
      return NextResponse.json({ 
        success: true, 
        message: `Kontingent für ${result.count} Mitarbeiter zurückgesetzt`,
        count: result.count 
      })
    }

    return NextResponse.json({ error: "No employees specified" }, { status: 400 })
  } catch (error) {
    console.error("Failed to reset quota:", error)
    return NextResponse.json({ error: "Failed to reset quota" }, { status: 500 })
  }
}

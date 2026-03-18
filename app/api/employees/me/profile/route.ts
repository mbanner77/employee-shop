import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("employee_session")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
    }

    const employee = await prisma.employee.findUnique({ where: { id: sessionId } })
    if (!employee) {
      return NextResponse.json({ error: "Mitarbeiter nicht gefunden" }, { status: 404 })
    }

    const body = await request.json()
    const { firstName, lastName, department } = body

    const updateData: Record<string, string> = {}
    if (firstName && typeof firstName === "string") updateData.firstName = firstName.trim()
    if (lastName && typeof lastName === "string") updateData.lastName = lastName.trim()
    if (department && typeof department === "string") updateData.department = department.trim()

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Keine Änderungen" }, { status: 400 })
    }

    const updated = await prisma.employee.update({
      where: { id: sessionId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        notifyStatusUpdates: true,
        notifyNewsletter: true,
        notifyWishlistAvailable: true,
      },
    })

    return NextResponse.json({ success: true, employee: updated })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Profil konnte nicht aktualisiert werden" }, { status: 500 })
  }
}

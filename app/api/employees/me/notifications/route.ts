import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

async function getAuthenticatedEmployee() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("employee_session")
  if (!sessionCookie) return null
  
  const employee = await prisma.employee.findUnique({
    where: { id: sessionCookie.value },
  })
  
  return employee?.isActive ? employee : null
}

// GET - Benachrichtigungseinstellungen abrufen
export async function GET() {
  try {
    const employee = await getAuthenticatedEmployee()
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    return NextResponse.json({
      notifyStatusUpdates: employee.notifyStatusUpdates,
      notifyNewsletter: employee.notifyNewsletter,
      notifyWishlistAvailable: employee.notifyWishlistAvailable,
    })
  } catch (error) {
    console.error("Failed to fetch notification settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// PUT - Benachrichtigungseinstellungen aktualisieren
export async function PUT(request: Request) {
  try {
    const employee = await getAuthenticatedEmployee()
    if (!employee) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    
    const updateData: Record<string, boolean> = {}
    
    if (typeof body.notifyStatusUpdates === "boolean") {
      updateData.notifyStatusUpdates = body.notifyStatusUpdates
    }
    if (typeof body.notifyNewsletter === "boolean") {
      updateData.notifyNewsletter = body.notifyNewsletter
    }
    if (typeof body.notifyWishlistAvailable === "boolean") {
      updateData.notifyWishlistAvailable = body.notifyWishlistAvailable
    }
    
    const updated = await prisma.employee.update({
      where: { id: employee.id },
      data: updateData,
      select: {
        notifyStatusUpdates: true,
        notifyNewsletter: true,
        notifyWishlistAvailable: true,
      },
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update notification settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

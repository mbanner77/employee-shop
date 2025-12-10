import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("employee_session")?.value

    if (!sessionId) {
      return NextResponse.json({ employee: null })
    }

    const employee = await prisma.employee.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        employeeId: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        isActive: true,
      },
    })

    if (!employee || !employee.isActive) {
      return NextResponse.json({ employee: null })
    }

    return NextResponse.json({ employee })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ employee: null })
  }
}

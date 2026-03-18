import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { hashPassword } from "@/lib/password"

// Generiere eine eindeutige Mitarbeiter-ID
async function generateEmployeeId(): Promise<string> {
  const prefix = "MA"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}${random}`
}

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, companyArea, password } = await request.json()

    if (!email || !firstName || !lastName || !companyArea || !password) {
      return NextResponse.json({ error: "Alle Felder sind erforderlich" }, { status: 400 })
    }

    // Check if employee already exists by email
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingEmployee) {
      return NextResponse.json({ error: "Diese E-Mail ist bereits registriert" }, { status: 400 })
    }

    // Auto-generate employee ID
    const employeeId = await generateEmployeeId()

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        email: email.toLowerCase(),
        firstName,
        lastName,
        department: companyArea, // Firmenbereich wird als department gespeichert
        password: await hashPassword(password),
      },
    })

    const cookieStore = await cookies()
    cookieStore.set("employee_session", employee.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        employeeId: employee.employeeId,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registrierung fehlgeschlagen" }, { status: 500 })
  }
}

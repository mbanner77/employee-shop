import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { employeeId, email, firstName, lastName, department, password } = await request.json()

    if (!employeeId || !email || !firstName || !lastName || !department || !password) {
      return NextResponse.json({ error: "Alle Felder sind erforderlich" }, { status: 400 })
    }

    // Check if employee already exists
    const existingEmployee = await prisma.employee.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { employeeId: employeeId },
        ],
      },
    })

    if (existingEmployee) {
      if (existingEmployee.email === email.toLowerCase()) {
        return NextResponse.json({ error: "Diese E-Mail ist bereits registriert" }, { status: 400 })
      }
      return NextResponse.json({ error: "Diese Personalnummer ist bereits registriert" }, { status: 400 })
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        email: email.toLowerCase(),
        firstName,
        lastName,
        department,
        password, // In production, hash this!
      },
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

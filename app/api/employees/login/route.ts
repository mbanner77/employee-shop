import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyPassword, hashPassword } from "@/lib/password"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "E-Mail und Passwort erforderlich" }, { status: 400 })
    }

    const employee = await prisma.employee.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!employee || !employee.password || !(await verifyPassword(password, employee.password))) {
      return NextResponse.json({ error: "Ungültige Anmeldedaten" }, { status: 401 })
    }

    // Auto-migrate plaintext password to bcrypt hash
    if (!employee.password.startsWith("$2a$") && !employee.password.startsWith("$2b$")) {
      await prisma.employee.update({
        where: { id: employee.id },
        data: { password: await hashPassword(password) },
      })
    }

    if (!employee.isActive) {
      return NextResponse.json({ error: "Ihr Konto ist deaktiviert" }, { status: 403 })
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("employee_session", employee.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login fehlgeschlagen" }, { status: 500 })
  }
}

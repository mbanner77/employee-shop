import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ error: "Token und Passwort erforderlich" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Passwort muss mindestens 6 Zeichen lang sein" }, { status: 400 })
    }

    const employee = await prisma.employee.findUnique({
      where: { passwordResetToken: token },
    })

    if (!employee) {
      return NextResponse.json({ error: "Ungültiger oder abgelaufener Link" }, { status: 400 })
    }

    if (!employee.passwordResetExpiry || employee.passwordResetExpiry < new Date()) {
      return NextResponse.json({ error: "Der Link ist abgelaufen. Bitte fordere einen neuen an." }, { status: 400 })
    }

    await prisma.employee.update({
      where: { id: employee.id },
      data: {
        password: password,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    })

    return NextResponse.json({ 
      success: true, 
      message: "Passwort wurde erfolgreich geändert. Du kannst dich jetzt anmelden." 
    })
  } catch (error) {
    console.error("Failed to reset password:", error)
    return NextResponse.json({ error: "Fehler beim Zurücksetzen des Passworts" }, { status: 500 })
  }
}

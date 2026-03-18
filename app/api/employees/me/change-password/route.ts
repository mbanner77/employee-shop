import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { verifyPassword, hashPassword } from "@/lib/password"

export async function POST(request: Request) {
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

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Aktuelles und neues Passwort erforderlich" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Das neue Passwort muss mindestens 6 Zeichen lang sein" }, { status: 400 })
    }

    const isValid = await verifyPassword(currentPassword, employee.password)
    if (!isValid) {
      return NextResponse.json({ error: "Aktuelles Passwort ist falsch" }, { status: 400 })
    }

    await prisma.employee.update({
      where: { id: employee.id },
      data: { password: await hashPassword(newPassword) },
    })

    return NextResponse.json({ success: true, message: "Passwort wurde erfolgreich geändert" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Passwort konnte nicht geändert werden" }, { status: 500 })
  }
}

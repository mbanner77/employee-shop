import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { hashPassword } from "@/lib/password"

async function isAdmin() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin-session")
  if (!adminSession) return false
  const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
  return !!admin
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { employees } = body

    if (!Array.isArray(employees) || employees.length === 0) {
      return NextResponse.json({ error: "No employees to import" }, { status: 400 })
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[],
    }

    for (const emp of employees) {
      try {
        if (!emp.employeeId || !emp.email || !emp.firstName || !emp.lastName) {
          results.errors.push(`Unvollständige Daten für ${emp.employeeId || emp.email || "unbekannt"}`)
          continue
        }

        const existing = await prisma.employee.findFirst({
          where: {
            OR: [
              { employeeId: emp.employeeId },
              { email: emp.email },
            ],
          },
        })

        if (existing) {
          await prisma.employee.update({
            where: { id: existing.id },
            data: {
              firstName: emp.firstName,
              lastName: emp.lastName,
              department: emp.department || existing.department,
              isActive: emp.isActive ?? existing.isActive,
            },
          })
          results.updated++
        } else {
          await prisma.employee.create({
            data: {
              employeeId: emp.employeeId,
              email: emp.email,
              firstName: emp.firstName,
              lastName: emp.lastName,
              department: emp.department || "Allgemein",
              password: await hashPassword(emp.password || "welcome123"),
              isActive: emp.isActive ?? true,
            },
          })
          results.created++
        }
      } catch (error) {
        console.error("Error importing employee:", error)
        results.errors.push(`Fehler bei ${emp.employeeId || emp.email}`)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Failed to import employees:", error)
    return NextResponse.json({ error: "Failed to import employees" }, { status: 500 })
  }
}

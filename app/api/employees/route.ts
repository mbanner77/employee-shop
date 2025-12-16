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

// GET all employees (admin only)
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        employeeId: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { lastName: "asc" },
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error("Failed to fetch employees:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

// POST create new employee (admin only)
export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { employeeId, email, firstName, lastName, department } = body

    if (!employeeId || !email || !firstName || !lastName) {
      return NextResponse.json({ error: "Alle Pflichtfelder ausfüllen" }, { status: 400 })
    }

    // Check for duplicates
    const existing = await prisma.employee.findFirst({
      where: {
        OR: [{ employeeId }, { email }],
      },
    })

    if (existing) {
      return NextResponse.json({ 
        error: existing.employeeId === employeeId 
          ? "Mitarbeiter-Nr. bereits vergeben" 
          : "E-Mail bereits registriert" 
      }, { status: 400 })
    }

    // Generate a random password (employee will need to reset it)
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        email,
        firstName,
        lastName,
        department: department || "Allgemein",
        password: randomPassword,
        isActive: true,
      },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error("Failed to create employee:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}

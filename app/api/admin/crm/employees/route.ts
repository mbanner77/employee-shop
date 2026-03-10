import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isAdminAuthenticated } from "@/lib/admin-auth"

function createRandomPassword() {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
}

function getLastActivityAt(values: Array<Date | null | undefined>) {
  return values
    .filter((value): value is Date => value instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null
}

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const employees = await prisma.employee.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        employeeId: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        language: true,
        isActive: true,
        notifyStatusUpdates: true,
        notifyNewsletter: true,
        notifyWishlistAvailable: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            orders: true,
            addresses: true,
            feedbacks: true,
            reviews: true,
            wishlistItems: true,
            favorites: true,
          },
        },
        orders: {
          select: { createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        feedbacks: {
          select: { createdAt: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        reviews: {
          select: { updatedAt: true },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
        wishlistItems: {
          select: { updatedAt: true },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    })

    return NextResponse.json(
      employees.map((employee) => ({
        id: employee.id,
        employeeId: employee.employeeId,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department,
        language: employee.language,
        isActive: employee.isActive,
        notifyStatusUpdates: employee.notifyStatusUpdates,
        notifyNewsletter: employee.notifyNewsletter,
        notifyWishlistAvailable: employee.notifyWishlistAvailable,
        company: employee.company,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
        counts: employee._count,
        lastOrderAt: employee.orders[0]?.createdAt ?? null,
        lastActivityAt: getLastActivityAt([
          employee.orders[0]?.createdAt,
          employee.feedbacks[0]?.createdAt,
          employee.reviews[0]?.updatedAt,
          employee.wishlistItems[0]?.updatedAt,
          employee.updatedAt,
        ]),
      })),
    )
  } catch (error) {
    console.error("Failed to fetch CRM employees:", error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const employeeId = String(body.employeeId || "").trim()
    const email = String(body.email || "").trim().toLowerCase()
    const firstName = String(body.firstName || "").trim()
    const lastName = String(body.lastName || "").trim()
    const department = String(body.department || "Allgemein").trim()
    const language = body.language === "en" ? "en" : "de"
    const password = String(body.password || "").trim() || createRandomPassword()

    if (!employeeId || !email || !firstName || !lastName) {
      return NextResponse.json({ error: "Employee ID, email, first name and last name are required" }, { status: 400 })
    }

    const existing = await prisma.employee.findFirst({
      where: {
        OR: [{ employeeId }, { email }],
      },
      select: {
        employeeId: true,
        email: true,
      },
    })

    if (existing) {
      return NextResponse.json(
        {
          error:
            existing.employeeId === employeeId
              ? "Mitarbeiter-Nr. bereits vergeben"
              : "E-Mail bereits registriert",
        },
        { status: 400 },
      )
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        email,
        firstName,
        lastName,
        department,
        language,
        password,
        isActive: body.isActive !== false,
        notifyStatusUpdates: body.notifyStatusUpdates !== false,
        notifyNewsletter: body.notifyNewsletter === true,
        notifyWishlistAvailable: body.notifyWishlistAvailable !== false,
      },
      select: {
        id: true,
        employeeId: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        language: true,
        isActive: true,
        createdAt: true,
      },
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error("Failed to create CRM employee:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

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

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isAdminAuthenticated } from "@/lib/admin-auth"

async function ensureEmployeeExists(employeeId: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  })

  return employee
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id: employeeId } = await params
    const body = await request.json()

    if (!(await ensureEmployeeExists(employeeId))) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    if (!body.street || !body.zip || !body.city) {
      return NextResponse.json({ error: "Street, ZIP and city are required" }, { status: 400 })
    }

    if (body.isDefault) {
      await prisma.employeeAddress.updateMany({
        where: { employeeId },
        data: { isDefault: false },
      })
    }

    const address = await prisma.employeeAddress.create({
      data: {
        employeeId,
        type: body.type || "PRIVATE",
        label: body.label?.trim() || null,
        street: String(body.street).trim(),
        zip: String(body.zip).trim(),
        city: String(body.city).trim(),
        country: String(body.country || "Deutschland").trim() || "Deutschland",
        isDefault: body.isDefault === true,
        isActive: true,
      },
    })

    return NextResponse.json(address, { status: 201 })
  } catch (error) {
    console.error("Failed to create CRM address:", error)
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id: employeeId } = await params
    const body = await request.json()
    const addressId = String(body.addressId || "").trim()

    if (!addressId) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 })
    }

    const existingAddress = await prisma.employeeAddress.findFirst({
      where: { id: addressId, employeeId, isActive: true },
      select: { id: true },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    if (!body.street || !body.zip || !body.city) {
      return NextResponse.json({ error: "Street, ZIP and city are required" }, { status: 400 })
    }

    if (body.isDefault) {
      await prisma.employeeAddress.updateMany({
        where: {
          employeeId,
          NOT: { id: addressId },
        },
        data: { isDefault: false },
      })
    }

    const address = await prisma.employeeAddress.update({
      where: { id: addressId },
      data: {
        type: body.type || "PRIVATE",
        label: body.label?.trim() || null,
        street: String(body.street).trim(),
        zip: String(body.zip).trim(),
        city: String(body.city).trim(),
        country: String(body.country || "Deutschland").trim() || "Deutschland",
        isDefault: body.isDefault === true,
      },
    })

    return NextResponse.json(address)
  } catch (error) {
    console.error("Failed to update CRM address:", error)
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id: employeeId } = await params
    const body = await request.json()
    const addressId = String(body.addressId || "").trim()

    if (!addressId) {
      return NextResponse.json({ error: "Address ID required" }, { status: 400 })
    }

    const existingAddress = await prisma.employeeAddress.findFirst({
      where: { id: addressId, employeeId, isActive: true },
      select: { id: true },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    await prisma.employeeAddress.update({
      where: { id: addressId },
      data: { isActive: false, isDefault: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete CRM address:", error)
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 })
  }
}

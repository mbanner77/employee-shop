import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { isAdminAuthenticated } from "@/lib/admin-auth"

const employeeDetailSelect: Prisma.EmployeeSelect = {
  id: true,
  employeeId: true,
  email: true,
  firstName: true,
  lastName: true,
  department: true,
  language: true,
  isActive: true,
  quotaResetDate: true,
  notifyStatusUpdates: true,
  notifyNewsletter: true,
  notifyWishlistAvailable: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: {
      id: true,
      name: true,
      billingAddress: true,
      paymentTerms: true,
    },
  },
  addresses: {
    where: { isActive: true },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      type: true,
      label: true,
      street: true,
      zip: true,
      city: true,
      country: true,
      isDefault: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  orders: {
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      status: true,
      orderType: true,
      privatePaymentStatus: true,
      adminNotes: true,
      trackingNumber: true,
      trackingUrl: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          size: true,
          color: true,
          quantity: true,
          costBearer: true,
          itemStatus: true,
          unitPrice: true,
          supplier: {
            select: {
              id: true,
              companyName: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              articleNumber: true,
              image: true,
            },
          },
        },
      },
    },
  },
  feedbacks: {
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderId: true,
      message: true,
      rating: true,
      createdAt: true,
    },
  },
  reviews: {
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          name: true,
          articleNumber: true,
          image: true,
        },
      },
    },
  },
  wishlistItems: {
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      preferredSize: true,
      preferredColor: true,
      notes: true,
      notifyWhenAvailable: true,
      notifiedAt: true,
      createdAt: true,
      updatedAt: true,
      product: {
        select: {
          id: true,
          name: true,
          articleNumber: true,
          image: true,
          isActive: true,
        },
      },
    },
  },
  favorites: {
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      product: {
        select: {
          id: true,
          name: true,
          articleNumber: true,
          image: true,
          isActive: true,
        },
      },
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
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const employee = await prisma.employee.findUnique({
      where: { id },
      select: employeeDetailSelect,
    })

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Failed to fetch CRM employee detail:", error)
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const currentEmployee = await prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        email: true,
      },
    })

    if (!currentEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    const nextEmployeeId = body.employeeId !== undefined ? String(body.employeeId || "").trim() : currentEmployee.employeeId
    const nextEmail = body.email !== undefined ? String(body.email || "").trim().toLowerCase() : currentEmployee.email

    if (!nextEmployeeId || !nextEmail) {
      return NextResponse.json({ error: "Employee ID and email are required" }, { status: 400 })
    }

    const duplicate = await prisma.employee.findFirst({
      where: {
        NOT: { id },
        OR: [{ employeeId: nextEmployeeId }, { email: nextEmail }],
      },
      select: {
        employeeId: true,
        email: true,
      },
    })

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            duplicate.employeeId === nextEmployeeId
              ? "Mitarbeiter-Nr. bereits vergeben"
              : "E-Mail bereits registriert",
        },
        { status: 400 },
      )
    }

    const data: Record<string, unknown> = {
      employeeId: nextEmployeeId,
      email: nextEmail,
    }

    if (body.firstName !== undefined) data.firstName = String(body.firstName || "").trim()
    if (body.lastName !== undefined) data.lastName = String(body.lastName || "").trim()
    if (body.department !== undefined) data.department = String(body.department || "").trim() || "Allgemein"
    if (body.language !== undefined) data.language = body.language === "en" ? "en" : "de"
    if (typeof body.isActive === "boolean") data.isActive = body.isActive
    if (typeof body.notifyStatusUpdates === "boolean") data.notifyStatusUpdates = body.notifyStatusUpdates
    if (typeof body.notifyNewsletter === "boolean") data.notifyNewsletter = body.notifyNewsletter
    if (typeof body.notifyWishlistAvailable === "boolean") data.notifyWishlistAvailable = body.notifyWishlistAvailable
    if (body.password !== undefined && String(body.password || "").trim()) {
      data.password = String(body.password).trim()
    }
    if (body.quotaResetDate !== undefined) {
      data.quotaResetDate = body.quotaResetDate ? new Date(body.quotaResetDate) : null
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data,
      select: employeeDetailSelect,
    })

    return NextResponse.json(updatedEmployee)
  } catch (error) {
    console.error("Failed to update CRM employee:", error)
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
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

    const { id } = await params

    await prisma.employee.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to deactivate CRM employee:", error)
    return NextResponse.json({ error: "Failed to deactivate employee" }, { status: 500 })
  }
}

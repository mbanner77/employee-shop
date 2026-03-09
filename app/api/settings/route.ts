import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const adminSession = cookieStore.get("admin-session")
  if (!adminSession) return false

  const admin = await prisma.adminUser.findUnique({ where: { id: adminSession.value } })
  return !!admin
}

// GET settings
export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "settings" },
    })

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: "settings" },
      })
    }

    const isAdmin = await isAdminAuthenticated()
    const microsoftSsoEnabled = Boolean(
      process.env.MICROSOFT_CLIENT_ID &&
      process.env.MICROSOFT_CLIENT_SECRET &&
      process.env.MICROSOFT_TENANT_ID,
    )

    if (!isAdmin) {
      return NextResponse.json({
        shopName: settings.shopName,
        maxItemsPerOrder: settings.maxItemsPerOrder,
        microsoftSsoEnabled,
      })
    }

    return NextResponse.json({
      ...settings,
      smtpPassword: settings.smtpPassword ? "••••••••" : "",
      microsoftSsoEnabled,
    })
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// PUT - update settings
export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const data = await request.json()

    // Don't update password if it's masked
    const updateData: Record<string, unknown> = { ...data }
    delete updateData.microsoftSsoEnabled
    if (updateData.smtpPassword === "••••••••") {
      delete updateData.smtpPassword
    }

    const settings = await prisma.settings.upsert({
      where: { id: "settings" },
      update: updateData,
      create: { id: "settings", ...updateData },
    })

    return NextResponse.json({
      ...settings,
      smtpPassword: settings.smtpPassword ? "••••••••" : "",
    })
  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

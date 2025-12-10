import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

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

    // Don't expose SMTP password
    return NextResponse.json({
      ...settings,
      smtpPassword: settings.smtpPassword ? "••••••••" : "",
    })
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

// PUT - update settings
export async function PUT(request: Request) {
  try {
    const data = await request.json()

    // Don't update password if it's masked
    const updateData: Record<string, unknown> = { ...data }
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

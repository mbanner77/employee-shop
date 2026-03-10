import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import {
  appTextSections,
  buildAppTextOverridesFromEntries,
  getAdminAppTextEntries,
} from "@/lib/app-texts"

async function getOrCreateSettings() {
  let settings = await prisma.settings.findUnique({
    where: { id: "settings" },
    select: {
      id: true,
      appTextOverrides: true,
      updatedAt: true,
    },
  })

  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: "settings" },
      select: {
        id: true,
        appTextOverrides: true,
        updatedAt: true,
      },
    })
  }

  return settings
}

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const settings = await getOrCreateSettings()

    return NextResponse.json({
      sections: appTextSections,
      entries: getAdminAppTextEntries(settings.appTextOverrides),
      updatedAt: settings.updatedAt,
    })
  } catch (error) {
    console.error("Failed to load admin app texts:", error)
    return NextResponse.json({ error: "Failed to load app texts" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const entries = Array.isArray(body?.entries) ? body.entries : []
    const appTextOverrides = buildAppTextOverridesFromEntries(entries)

    const settings = await prisma.settings.upsert({
      where: { id: "settings" },
      update: { appTextOverrides },
      create: { id: "settings", appTextOverrides },
      select: {
        appTextOverrides: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      sections: appTextSections,
      entries: getAdminAppTextEntries(settings.appTextOverrides),
      updatedAt: settings.updatedAt,
    })
  } catch (error) {
    console.error("Failed to update admin app texts:", error)
    return NextResponse.json({ error: "Failed to save app texts" }, { status: 500 })
  }
}

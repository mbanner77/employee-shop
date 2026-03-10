import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import {
  MICROSOFT_SECRET_MASK,
  maskMicrosoftClientSecret,
  resolveMicrosoftSsoConfiguration,
} from "@/lib/microsoft-365"

async function getOrCreateSettings() {
  let settings = await prisma.settings.findUnique({
    where: { id: "settings" },
  })

  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: "settings" },
    })
  }

  return settings
}

// GET settings
export async function GET(request: Request) {
  try {
    const settings = await getOrCreateSettings()
    const { appTextOverrides: _appTextOverrides, ...settingsResponse } = settings

    const isAdmin = await isAdminAuthenticated()
    const microsoftConfiguration = resolveMicrosoftSsoConfiguration(settings, request)

    if (!isAdmin) {
      return NextResponse.json({
        shopName: settings.shopName,
        maxItemsPerOrder: settings.maxItemsPerOrder,
        microsoftSsoEnabled: microsoftConfiguration.active,
      })
    }

    return NextResponse.json({
      ...settingsResponse,
      smtpPassword: settings.smtpPassword ? "••••••••" : "",
      microsoftClientSecret: maskMicrosoftClientSecret(settings.microsoftClientSecret),
      microsoftSsoConfigured: microsoftConfiguration.configured,
      microsoftSsoActive: microsoftConfiguration.active,
      microsoftComputedRedirectUri: microsoftConfiguration.redirectUri,
      microsoftConfigSource: microsoftConfiguration.source,
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
    if (updateData.smtpPassword === "••••••••") {
      delete updateData.smtpPassword
    }
    if (updateData.microsoftClientSecret === MICROSOFT_SECRET_MASK) {
      delete updateData.microsoftClientSecret
    }

    delete updateData.microsoftSsoConfigured
    delete updateData.microsoftSsoActive
    delete updateData.microsoftComputedRedirectUri
    delete updateData.microsoftConfigSource
    delete updateData.appTextOverrides

    if (typeof updateData.microsoftTenantId === "string") {
      updateData.microsoftTenantId = updateData.microsoftTenantId.trim()
    }
    if (typeof updateData.microsoftClientId === "string") {
      updateData.microsoftClientId = updateData.microsoftClientId.trim()
    }
    if (typeof updateData.microsoftRedirectUri === "string") {
      updateData.microsoftRedirectUri = updateData.microsoftRedirectUri.trim()
    }
    if (typeof updateData.microsoftAllowedDomains === "string") {
      updateData.microsoftAllowedDomains = updateData.microsoftAllowedDomains
        .split(",")
        .map((domain: string) => domain.trim().toLowerCase())
        .filter(Boolean)
        .join(", ")
    }
    if (typeof updateData.microsoftDefaultDepartment === "string") {
      updateData.microsoftDefaultDepartment = updateData.microsoftDefaultDepartment.trim() || "Microsoft 365"
    }

    const settings = await prisma.settings.upsert({
      where: { id: "settings" },
      update: updateData,
      create: { id: "settings", ...updateData },
    })
    const { appTextOverrides: _appTextOverrides, ...settingsResponse } = settings

    const microsoftConfiguration = resolveMicrosoftSsoConfiguration(settings, request)

    return NextResponse.json({
      ...settingsResponse,
      smtpPassword: settings.smtpPassword ? "••••••••" : "",
      microsoftClientSecret: maskMicrosoftClientSecret(settings.microsoftClientSecret),
      microsoftSsoConfigured: microsoftConfiguration.configured,
      microsoftSsoActive: microsoftConfiguration.active,
      microsoftComputedRedirectUri: microsoftConfiguration.redirectUri,
      microsoftConfigSource: microsoftConfiguration.source,
    })
  } catch (error) {
    console.error("Failed to update settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import {
  fetchMicrosoftOpenIdConfiguration,
  getMicrosoftSsoConfiguration,
} from "@/lib/microsoft-365"

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const config = await getMicrosoftSsoConfiguration(request)
    const checks = [
      {
        label: "Aktivierung",
        status: config.enabled ? "success" : "warning",
        detail: config.enabled
          ? "Microsoft-365-SSO ist im Admin aktiviert."
          : "Microsoft-365-SSO ist gespeichert, aber noch nicht aktiviert.",
      },
      {
        label: "Client-Konfiguration",
        status: config.configured ? "success" : "error",
        detail: config.configured
          ? "Tenant-ID, Client-ID, Client-Secret und Redirect-URI sind vorhanden."
          : "Mindestens ein Pflichtfeld für Microsoft-365 fehlt.",
      },
      {
        label: "Redirect-URI",
        status: config.redirectUri ? "success" : "error",
        detail: config.redirectUri || "Keine Redirect-URI verfügbar.",
      },
      {
        label: "Automatische Mitarbeiteranlage",
        status: config.autoCreateEmployees ? "warning" : "success",
        detail: config.autoCreateEmployees
          ? "Neue Mitarbeiterkonten werden bei gültigem Microsoft-365-Login automatisch angelegt."
          : "Es dürfen sich nur bereits vorhandene Mitarbeiterkonten per Microsoft 365 anmelden.",
      },
    ] as Array<{ label: string; status: "success" | "warning" | "error"; detail: string }>

    if (!config.configured) {
      return NextResponse.json({
        configured: config.configured,
        enabled: config.enabled,
        active: config.active,
        source: config.source,
        redirectUri: config.redirectUri,
        allowedDomains: config.allowedDomains,
        checks,
      })
    }

    const openIdConfiguration = await fetchMicrosoftOpenIdConfiguration(config)

    return NextResponse.json({
      configured: config.configured,
      enabled: config.enabled,
      active: config.active,
      source: config.source,
      redirectUri: config.redirectUri,
      allowedDomains: config.allowedDomains,
      authorizationEndpoint: openIdConfiguration.authorization_endpoint,
      tokenEndpoint: openIdConfiguration.token_endpoint,
      issuer: openIdConfiguration.issuer,
      endSessionEndpoint: openIdConfiguration.end_session_endpoint || "",
      checks: [
        ...checks,
        {
          label: "OpenID-Metadaten",
          status: "success",
          detail: "Microsoft OpenID Connect Discovery wurde erfolgreich geladen.",
        },
      ],
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Microsoft-365-Test fehlgeschlagen.",
      },
      { status: 500 },
    )
  }
}

import crypto from "crypto"
import { prisma } from "@/lib/db"

export const MICROSOFT_SECRET_MASK = "••••••••"

type MicrosoftSettingsSnapshot = {
  microsoftSsoEnabled?: boolean | null
  microsoftTenantId?: string | null
  microsoftClientId?: string | null
  microsoftClientSecret?: string | null
  microsoftRedirectUri?: string | null
  microsoftAllowedDomains?: string | null
  microsoftAutoCreateEmployees?: boolean | null
  microsoftDefaultDepartment?: string | null
}

export type MicrosoftSsoConfiguration = {
  enabled: boolean
  configured: boolean
  active: boolean
  tenantId: string
  clientId: string
  clientSecret: string
  redirectUri: string
  allowedDomains: string[]
  allowedDomainsRaw: string
  autoCreateEmployees: boolean
  defaultDepartment: string
  source: "database" | "environment" | "mixed" | "none"
}

export type MicrosoftGraphProfile = {
  id: string
  displayName?: string | null
  givenName?: string | null
  surname?: string | null
  mail?: string | null
  userPrincipalName?: string | null
  department?: string | null
}

function getTrimmedValue(value: string | null | undefined) {
  return value?.trim() || ""
}

function getPreferredValue(databaseValue: string | null | undefined, envValue: string | undefined) {
  return getTrimmedValue(databaseValue) || getTrimmedValue(envValue)
}

function normalizeDomains(value: string | null | undefined) {
  return (value || "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean)
}

function getConfigurationSource(settings: MicrosoftSettingsSnapshot | null | undefined) {
  const hasDatabaseValues = Boolean(
    getTrimmedValue(settings?.microsoftTenantId) ||
      getTrimmedValue(settings?.microsoftClientId) ||
      getTrimmedValue(settings?.microsoftClientSecret) ||
      getTrimmedValue(settings?.microsoftRedirectUri),
  )

  const hasEnvironmentValues = Boolean(
    process.env.MICROSOFT_TENANT_ID ||
      process.env.MICROSOFT_CLIENT_ID ||
      process.env.MICROSOFT_CLIENT_SECRET ||
      process.env.MICROSOFT_REDIRECT_URI,
  )

  if (hasDatabaseValues && hasEnvironmentValues) {
    return "mixed"
  }

  if (hasDatabaseValues) {
    return "database"
  }

  if (hasEnvironmentValues) {
    return "environment"
  }

  return "none"
}

export function getRequestOrigin(request: Request) {
  const url = new URL(request.url)
  return url.origin
}

export function sanitizeReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/"
  }

  return value
}

export function resolveMicrosoftSsoConfiguration(
  settings: MicrosoftSettingsSnapshot | null | undefined,
  request?: Request,
): MicrosoftSsoConfiguration {
  const tenantId = getPreferredValue(settings?.microsoftTenantId, process.env.MICROSOFT_TENANT_ID)
  const clientId = getPreferredValue(settings?.microsoftClientId, process.env.MICROSOFT_CLIENT_ID)
  const clientSecret = getPreferredValue(settings?.microsoftClientSecret, process.env.MICROSOFT_CLIENT_SECRET)
  const configuredRedirectUri = getPreferredValue(settings?.microsoftRedirectUri, process.env.MICROSOFT_REDIRECT_URI)
  const redirectUri = configuredRedirectUri || (request ? `${getRequestOrigin(request)}/api/auth/microsoft/callback` : "")
  const allowedDomainsRaw =
    getTrimmedValue(settings?.microsoftAllowedDomains) || getTrimmedValue(process.env.MICROSOFT_ALLOWED_DOMAINS)
  const autoCreateEmployees =
    settings?.microsoftAutoCreateEmployees ?? process.env.MICROSOFT_AUTO_CREATE_EMPLOYEES === "true"
  const defaultDepartment =
    getTrimmedValue(settings?.microsoftDefaultDepartment) ||
    getTrimmedValue(process.env.MICROSOFT_DEFAULT_DEPARTMENT) ||
    "Microsoft 365"
  const enabled = Boolean(settings?.microsoftSsoEnabled)
  const configured = Boolean(tenantId && clientId && clientSecret && redirectUri)

  return {
    enabled,
    configured,
    active: enabled && configured,
    tenantId,
    clientId,
    clientSecret,
    redirectUri,
    allowedDomains: normalizeDomains(allowedDomainsRaw),
    allowedDomainsRaw,
    autoCreateEmployees: Boolean(autoCreateEmployees),
    defaultDepartment,
    source: getConfigurationSource(settings),
  }
}

export async function getMicrosoftSsoConfiguration(request?: Request) {
  const settings = await prisma.settings.findUnique({
    where: { id: "settings" },
    select: {
      microsoftSsoEnabled: true,
      microsoftTenantId: true,
      microsoftClientId: true,
      microsoftClientSecret: true,
      microsoftRedirectUri: true,
      microsoftAllowedDomains: true,
      microsoftAutoCreateEmployees: true,
      microsoftDefaultDepartment: true,
    },
  })

  return resolveMicrosoftSsoConfiguration(settings, request)
}

export function maskMicrosoftClientSecret(secret: string | null | undefined) {
  return secret ? MICROSOFT_SECRET_MASK : ""
}

export function createMicrosoftOauthState() {
  return crypto.randomBytes(32).toString("hex")
}

export function buildMicrosoftAuthorizationUrl(config: MicrosoftSsoConfiguration, state: string) {
  const url = new URL(
    `https://login.microsoftonline.com/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/authorize`,
  )

  url.searchParams.set("client_id", config.clientId)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("redirect_uri", config.redirectUri)
  url.searchParams.set("response_mode", "query")
  url.searchParams.set("scope", "openid profile email User.Read")
  url.searchParams.set("state", state)
  url.searchParams.set("prompt", "select_account")

  return url.toString()
}

export async function exchangeMicrosoftAuthorizationCode(config: MicrosoftSsoConfiguration, code: string) {
  const response = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
        scope: "openid profile email User.Read",
      }),
    },
  )

  const data = (await response.json()) as {
    access_token?: string
    error?: string
    error_description?: string
  }

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Microsoft token exchange failed")
  }

  return data.access_token
}

export async function fetchMicrosoftGraphProfile(accessToken: string) {
  const response = await fetch(
    "https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,mail,userPrincipalName,department",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  const data = (await response.json()) as MicrosoftGraphProfile & {
    error?: { message?: string }
  }

  if (!response.ok || !data.id) {
    throw new Error(data.error?.message || "Failed to fetch Microsoft profile")
  }

  return data
}

export async function fetchMicrosoftOpenIdConfiguration(config: MicrosoftSsoConfiguration) {
  const response = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(config.tenantId)}/v2.0/.well-known/openid-configuration`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  )

  const data = (await response.json()) as {
    authorization_endpoint?: string
    token_endpoint?: string
    issuer?: string
    end_session_endpoint?: string
    error?: string
    error_description?: string
  }

  if (!response.ok || !data.authorization_endpoint || !data.token_endpoint) {
    throw new Error(data.error_description || data.error || "Failed to load Microsoft OpenID configuration")
  }

  return data
}

export function isMicrosoftEmailAllowed(email: string, allowedDomains: string[]) {
  if (allowedDomains.length === 0) {
    return true
  }

  const domain = email.split("@")[1]?.toLowerCase()
  if (!domain) {
    return false
  }

  return allowedDomains.includes(domain)
}

export function buildMicrosoftEmployeeId() {
  return `MS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
}

export function getMicrosoftPrimaryEmail(profile: MicrosoftGraphProfile) {
  return (profile.mail || profile.userPrincipalName || "").trim().toLowerCase()
}

export function getMicrosoftFirstName(profile: MicrosoftGraphProfile) {
  if (profile.givenName?.trim()) {
    return profile.givenName.trim()
  }

  const [firstName] = (profile.displayName || "").trim().split(/\s+/)
  return firstName || "Microsoft"
}

export function getMicrosoftLastName(profile: MicrosoftGraphProfile) {
  if (profile.surname?.trim()) {
    return profile.surname.trim()
  }

  const parts = (profile.displayName || "").trim().split(/\s+/)
  return parts.slice(1).join(" ") || "User"
}

export function buildMicrosoftAuthErrorRedirect(request: Request, message: string) {
  const url = new URL("/", request.url)
  url.searchParams.set("sso_error", message)
  return url
}

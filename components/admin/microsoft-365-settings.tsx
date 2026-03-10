"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Save, Settings, ShieldCheck } from "lucide-react"

export interface Microsoft365SettingsValue {
  microsoftSsoEnabled: boolean
  microsoftTenantId: string
  microsoftClientId: string
  microsoftClientSecret: string
  microsoftRedirectUri: string
  microsoftAllowedDomains: string
  microsoftAutoCreateEmployees: boolean
  microsoftDefaultDepartment: string
  microsoftSsoConfigured?: boolean
  microsoftSsoActive?: boolean
  microsoftComputedRedirectUri?: string
  microsoftConfigSource?: string
}

interface MicrosoftCheckResult {
  configured: boolean
  enabled: boolean
  active: boolean
  source: string
  redirectUri: string
  allowedDomains: string[]
  authorizationEndpoint?: string
  tokenEndpoint?: string
  issuer?: string
  endSessionEndpoint?: string
  checks: Array<{
    label: string
    status: "success" | "warning" | "error"
    detail: string
  }>
  error?: string
}

interface AdminMicrosoft365SettingsProps {
  onRefresh: () => Promise<void>
  settings: Microsoft365SettingsValue
}

function createDraft(settings: Microsoft365SettingsValue): Microsoft365SettingsValue {
  return {
    microsoftSsoEnabled: settings.microsoftSsoEnabled,
    microsoftTenantId: settings.microsoftTenantId || "",
    microsoftClientId: settings.microsoftClientId || "",
    microsoftClientSecret: settings.microsoftClientSecret || "",
    microsoftRedirectUri: settings.microsoftRedirectUri || "",
    microsoftAllowedDomains: settings.microsoftAllowedDomains || "",
    microsoftAutoCreateEmployees: settings.microsoftAutoCreateEmployees,
    microsoftDefaultDepartment: settings.microsoftDefaultDepartment || "Microsoft 365",
    microsoftSsoConfigured: settings.microsoftSsoConfigured,
    microsoftSsoActive: settings.microsoftSsoActive,
    microsoftComputedRedirectUri: settings.microsoftComputedRedirectUri || "",
    microsoftConfigSource: settings.microsoftConfigSource || "none",
  }
}

function getStatusVariant(settings: Microsoft365SettingsValue) {
  if (settings.microsoftSsoActive) {
    return "secondary"
  }

  return settings.microsoftSsoConfigured ? "outline" : "destructive"
}

function getStatusLabel(settings: Microsoft365SettingsValue) {
  if (settings.microsoftSsoActive) {
    return "Aktiv"
  }

  if (settings.microsoftSsoConfigured) {
    return "Konfiguriert"
  }

  return "Nicht eingerichtet"
}

function getCheckBadgeClasses(status: "success" | "warning" | "error") {
  if (status === "success") {
    return "border-green-200 bg-green-50 text-green-800"
  }

  if (status === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-800"
  }

  return "border-red-200 bg-red-50 text-red-800"
}

export function AdminMicrosoft365Settings({ onRefresh, settings }: AdminMicrosoft365SettingsProps) {
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [checkDialogOpen, setCheckDialogOpen] = useState(false)
  const [draft, setDraft] = useState<Microsoft365SettingsValue>(createDraft(settings))
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [checkResult, setCheckResult] = useState<MicrosoftCheckResult | null>(null)
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const effectiveRedirectUri = useMemo(() => {
    return draft.microsoftRedirectUri.trim() || settings.microsoftComputedRedirectUri || (origin ? `${origin}/api/auth/microsoft/callback` : "")
  }, [draft.microsoftRedirectUri, origin, settings.microsoftComputedRedirectUri])

  const openConfigDialog = () => {
    setDraft(createDraft(settings))
    setMessage(null)
    setConfigDialogOpen(true)
  }

  const runCheck = async () => {
    setTesting(true)
    setMessage(null)
    try {
      const response = await fetch("/api/admin/integrations/microsoft/test", {
        method: "POST",
      })
      const data = (await response.json()) as MicrosoftCheckResult & { error?: string }

      if (!response.ok) {
        setCheckResult(null)
        setMessage({ type: "error", text: data.error || "Microsoft-365-Prüfung fehlgeschlagen" })
        return
      }

      setCheckResult(data)
    } catch {
      setCheckResult(null)
      setMessage({ type: "error", text: "Verbindungsfehler bei der Microsoft-365-Prüfung" })
    } finally {
      setTesting(false)
    }
  }

  const openCheckDialog = async () => {
    setCheckDialogOpen(true)
    setCheckResult(null)
    await runCheck()
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          microsoftSsoEnabled: draft.microsoftSsoEnabled,
          microsoftTenantId: draft.microsoftTenantId,
          microsoftClientId: draft.microsoftClientId,
          microsoftClientSecret: draft.microsoftClientSecret,
          microsoftRedirectUri: draft.microsoftRedirectUri,
          microsoftAllowedDomains: draft.microsoftAllowedDomains,
          microsoftAutoCreateEmployees: draft.microsoftAutoCreateEmployees,
          microsoftDefaultDepartment: draft.microsoftDefaultDepartment,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: "error", text: data.error || "Microsoft-365-Einstellungen konnten nicht gespeichert werden" })
        return
      }

      setMessage({ type: "success", text: "Microsoft-365-Einstellungen gespeichert" })
      setConfigDialogOpen(false)
      await onRefresh()
    } catch {
      setMessage({ type: "error", text: "Verbindungsfehler beim Speichern der Microsoft-365-Einstellungen" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Microsoft 365 / O365
          </CardTitle>
          <CardDescription>Konfiguriere Microsoft Entra ID für den Mitarbeiter-Login und prüfe die Einrichtung direkt im Admin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className={`rounded-lg p-3 text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message.text}
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium">SSO-Status</p>
                  <p className="text-sm text-muted-foreground">
                    {settings.microsoftSsoActive
                      ? "Microsoft-365-Login ist aktiv und kann von Mitarbeitern genutzt werden."
                      : settings.microsoftSsoConfigured
                        ? "Microsoft-365 ist konfiguriert, aber noch nicht aktiv geschaltet."
                        : "Microsoft-365 ist noch nicht vollständig eingerichtet."}
                  </p>
                </div>
                <Badge variant={getStatusVariant(settings)}>{getStatusLabel(settings)}</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-muted/60 p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Konfigurationsquelle</div>
                  <div className="mt-1 font-medium capitalize">{settings.microsoftConfigSource || "none"}</div>
                </div>
                <div className="rounded-md bg-muted/60 p-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Freigegebene Domains</div>
                  <div className="mt-1 font-medium">{settings.microsoftAllowedDomains || "Alle Domains"}</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <p className="font-medium">Redirect-URI</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Diese URL muss in der App-Registrierung in Microsoft Entra ID als Redirect-URI hinterlegt sein.
              </p>
              <Input className="mt-3" value={settings.microsoftComputedRedirectUri || (origin ? `${origin}/api/auth/microsoft/callback` : "")} readOnly />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={openConfigDialog}>
              <Settings className="mr-2 h-4 w-4" />
              Konfigurieren
            </Button>
            <Button variant="outline" onClick={openCheckDialog}>
              Einrichtungscheck
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Microsoft 365 konfigurieren</DialogTitle>
            <DialogDescription>Pflege Tenant, App-Registrierung, Redirect-URI und optionale Regeln für automatische Mitarbeiterkonten.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <div className="font-medium">Microsoft-365-SSO aktivieren</div>
                <div className="text-sm text-muted-foreground">Der Button im Mitarbeiter-Login wird nur angezeigt, wenn diese Option aktiv und die Konfiguration vollständig ist.</div>
              </div>
              <Switch
                checked={draft.microsoftSsoEnabled}
                onCheckedChange={(checked) => setDraft((current) => ({ ...current, microsoftSsoEnabled: checked }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="microsoft-tenant-id">Tenant-ID</Label>
                <Input
                  id="microsoft-tenant-id"
                  value={draft.microsoftTenantId}
                  onChange={(event) => setDraft((current) => ({ ...current, microsoftTenantId: event.target.value }))}
                  placeholder="z. B. contoso.onmicrosoft.com oder Tenant GUID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="microsoft-client-id">Client-ID</Label>
                <Input
                  id="microsoft-client-id"
                  value={draft.microsoftClientId}
                  onChange={(event) => setDraft((current) => ({ ...current, microsoftClientId: event.target.value }))}
                  placeholder="Application (client) ID"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="microsoft-client-secret">Client-Secret</Label>
                <Input
                  id="microsoft-client-secret"
                  type="password"
                  value={draft.microsoftClientSecret}
                  onChange={(event) => setDraft((current) => ({ ...current, microsoftClientSecret: event.target.value }))}
                  placeholder="Client Secret aus Microsoft Entra ID"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="microsoft-redirect-uri">Redirect-URI</Label>
                <Input
                  id="microsoft-redirect-uri"
                  value={draft.microsoftRedirectUri}
                  onChange={(event) => setDraft((current) => ({ ...current, microsoftRedirectUri: event.target.value }))}
                  placeholder="Optional. Leer lassen für die automatisch berechnete Callback-URL"
                />
                <p className="text-xs text-muted-foreground">Effektive Redirect-URI: {effectiveRedirectUri || "-"}</p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="microsoft-allowed-domains">Erlaubte Domains</Label>
                <Input
                  id="microsoft-allowed-domains"
                  value={draft.microsoftAllowedDomains}
                  onChange={(event) => setDraft((current) => ({ ...current, microsoftAllowedDomains: event.target.value }))}
                  placeholder="z. B. realcore.de, realcore.info"
                />
                <p className="text-xs text-muted-foreground">Leer lassen, um alle Microsoft-365-Domains zuzulassen.</p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <div className="font-medium">Mitarbeiter automatisch anlegen</div>
                  <div className="text-sm text-muted-foreground">Falls kein Konto existiert, wird beim ersten Microsoft-365-Login automatisch ein Mitarbeiterdatensatz erzeugt.</div>
                </div>
                <Switch
                  checked={draft.microsoftAutoCreateEmployees}
                  onCheckedChange={(checked) => setDraft((current) => ({ ...current, microsoftAutoCreateEmployees: checked }))}
                />
              </div>
              <div className="space-y-2 rounded-lg border p-4">
                <Label htmlFor="microsoft-default-department">Standard-Abteilung</Label>
                <Input
                  id="microsoft-default-department"
                  value={draft.microsoftDefaultDepartment}
                  onChange={(event) => setDraft((current) => ({ ...current, microsoftDefaultDepartment: event.target.value }))}
                  placeholder="Microsoft 365"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={checkDialogOpen} onOpenChange={setCheckDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Microsoft-365-Einrichtungscheck</DialogTitle>
            <DialogDescription>Prüft die gespeicherte Konfiguration und lädt die OpenID-Connect-Metadaten aus Microsoft Entra ID.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <div className="font-medium">Aktueller Check</div>
                <div className="text-sm text-muted-foreground">Mit dem Button kannst du die Konfiguration jederzeit erneut validieren.</div>
              </div>
              <Button variant="outline" onClick={runCheck} disabled={testing}>
                {testing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Neu prüfen
              </Button>
            </div>

            {checkResult ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg border p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Aktiviert</div>
                    <div className="mt-1 font-medium">{checkResult.enabled ? "Ja" : "Nein"}</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Konfiguriert</div>
                    <div className="mt-1 font-medium">{checkResult.configured ? "Ja" : "Nein"}</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Produktiv aktiv</div>
                    <div className="mt-1 font-medium">{checkResult.active ? "Ja" : "Nein"}</div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Quelle</div>
                    <div className="mt-1 font-medium capitalize">{checkResult.source}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {checkResult.checks.map((check) => (
                    <div key={check.label} className={`rounded-lg border p-4 ${getCheckBadgeClasses(check.status)}`}>
                      <div className="font-medium">{check.label}</div>
                      <div className="mt-1 text-sm">{check.detail}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 rounded-lg border p-4">
                    <Label>Redirect-URI</Label>
                    <Input readOnly value={checkResult.redirectUri || ""} />
                  </div>
                  <div className="space-y-2 rounded-lg border p-4">
                    <Label>Freigegebene Domains</Label>
                    <Input readOnly value={checkResult.allowedDomains.length > 0 ? checkResult.allowedDomains.join(", ") : "Alle Domains"} />
                  </div>
                  <div className="space-y-2 rounded-lg border p-4">
                    <Label>Authorization Endpoint</Label>
                    <Input readOnly value={checkResult.authorizationEndpoint || "-"} />
                  </div>
                  <div className="space-y-2 rounded-lg border p-4">
                    <Label>Token Endpoint</Label>
                    <Input readOnly value={checkResult.tokenEndpoint || "-"} />
                  </div>
                  <div className="space-y-2 rounded-lg border p-4 sm:col-span-2">
                    <Label>Issuer</Label>
                    <Input readOnly value={checkResult.issuer || "-"} />
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {testing ? "Microsoft-365-Konfiguration wird geprüft..." : "Noch kein Prüfergebnis vorhanden."}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

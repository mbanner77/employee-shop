"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { getAdminApiErrorMessage } from "@/lib/admin-client"
import { Loader2, Save, Mail, Settings, Store, Send } from "lucide-react"
import { AdminCompanyAreas } from "./admin-company-areas"
import { AdminMicrosoft365Settings, type Microsoft365SettingsValue } from "./microsoft-365-settings"

interface Settings extends Microsoft365SettingsValue {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPassword: string
  smtpSecure: boolean
  emailFrom: string
  emailFromName: string
  notifyOnOrder: boolean
  notifyOnShipment: boolean
  notifyOnFeedback: boolean
  adminEmail: string
  shopName: string
  maxItemsPerOrder: number
}

function cloneSettings(settings: Settings) {
  return {
    ...settings,
  }
}

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [savedSettings, setSavedSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings?scope=admin", {
        cache: "no-store",
      })
      if (!response.ok) {
        setMessage({
          type: "error",
          text: await getAdminApiErrorMessage(response, "Einstellungen konnten nicht geladen werden"),
        })
        return
      }
      const data = await response.json()
      setSettings(cloneSettings(data))
      setSavedSettings(cloneSettings(data))
    } catch (error) {
      console.error("Failed to fetch settings:", error)
      setMessage({ type: "error", text: "Verbindungsfehler beim Laden der Einstellungen" })
    } finally {
      setLoading(false)
    }
  }

  const hasUnsavedChanges = useMemo(() => {
    if (!settings || !savedSettings) {
      return false
    }

    return JSON.stringify(settings) !== JSON.stringify(savedSettings)
  }, [savedSettings, settings])

  const settingsSummary = useMemo(() => {
    if (!settings) {
      return null
    }

    return {
      emailConfigured: Boolean(settings.smtpHost && settings.smtpUser && settings.emailFrom),
      microsoftConfigured: Boolean(settings.microsoftSsoConfigured),
      notificationChannelsEnabled: [settings.notifyOnOrder, settings.notifyOnShipment].filter(Boolean).length,
    }
  }, [settings])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Einstellungen gespeichert" })
        await fetchSettings()
      } else {
        setMessage({
          type: "error",
          text: await getAdminApiErrorMessage(response, "Speichern fehlgeschlagen"),
        })
      }
    } catch {
      setMessage({ type: "error", text: "Verbindungsfehler" })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    if (settings) {
      setSettings({ ...settings, [key]: value })
    }
  }

  const handleDiscardChanges = () => {
    if (!savedSettings) {
      return
    }

    setSettings(cloneSettings(savedSettings))
    setMessage(null)
  }

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: "error", text: "Bitte E-Mail-Adresse eingeben" })
      return
    }
    setSendingTest(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: "success", text: data.message })
      } else {
        setMessage({
          type: "error",
          text: await getAdminApiErrorMessage(response, "Senden fehlgeschlagen"),
        })
      }
    } catch {
      setMessage({ type: "error", text: "Verbindungsfehler" })
    } finally {
      setSendingTest(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!settings) {
    return <div className="text-center py-12 text-muted-foreground">Einstellungen konnten nicht geladen werden</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>
            {hasUnsavedChanges ? <Badge>Ungespeicherte Änderungen</Badge> : <Badge variant="outline">Synchron</Badge>}
          </div>
          <p className="text-muted-foreground">Konfiguriere den Shop und E-Mail-Versand</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void fetchSettings()} disabled={loading || saving || sendingTest}>
            <Loader2 className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Neu laden
          </Button>
          <Button variant="outline" onClick={handleDiscardChanges} disabled={!hasUnsavedChanges || saving}>
            Änderungen verwerfen
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message.text}
        </div>
      )}

      {settingsSummary && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{settings.shopName || "—"}</div>
              <div className="text-sm text-muted-foreground">Aktueller Shop-Name</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{settings.maxItemsPerOrder}</div>
              <div className="text-sm text-muted-foreground">Max. Artikel pro Bestellung</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{settingsSummary.notificationChannelsEnabled}</div>
              <div className="text-sm text-muted-foreground">Aktive Benachrichtigungsregeln</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between gap-3 pt-6">
              <div>
                <div className="font-medium">Systemstatus</div>
                <div className="text-sm text-muted-foreground">
                  {settingsSummary.emailConfigured ? "Mail konfiguriert" : "Mail offen"} ·{" "}
                  {settingsSummary.microsoftConfigured ? "SSO bereit" : "SSO offen"}
                </div>
              </div>
              <Badge variant={settingsSummary.emailConfigured && settingsSummary.microsoftConfigured ? "secondary" : "outline"}>
                {settingsSummary.emailConfigured && settingsSummary.microsoftConfigured ? "Bereit" : "Prüfen"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6">
        {/* Firmenbereiche */}
        <AdminCompanyAreas />

        {/* Shop Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Shop-Einstellungen
            </CardTitle>
            <CardDescription>Allgemeine Einstellungen für den Shop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop-Name</Label>
                <Input
                  id="shopName"
                  value={settings.shopName}
                  onChange={(e) => updateSetting("shopName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxItems">Max. Artikel pro Bestellung</Label>
                <Input
                  id="maxItems"
                  type="number"
                  min={1}
                  max={10}
                  value={settings.maxItemsPerOrder}
                  onChange={(e) => updateSetting("maxItemsPerOrder", parseInt(e.target.value) || 4)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Integrationen
            </CardTitle>
            <CardDescription>SSO-Status, Microsoft-365-Konfiguration und aktuelle CMS-Basis des Shops</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminMicrosoft365Settings settings={settings} onRefresh={fetchSettings} />
            <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div className="space-y-1">
                <p className="font-medium">CMS-Basis</p>
                <p className="text-sm text-muted-foreground">
                  Produkt- und Shop-Inhalte werden aktuell direkt im internen Admin-Backend gepflegt. Es ist kein externes CMS angebunden.
                </p>
              </div>
              <Badge variant="secondary">Internes Admin-CMS</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              E-Mail-Einstellungen
            </CardTitle>
            <CardDescription>SMTP-Server für den E-Mail-Versand konfigurieren</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Server</Label>
                <Input
                  id="smtpHost"
                  placeholder="smtp.example.com"
                  value={settings.smtpHost}
                  onChange={(e) => updateSetting("smtpHost", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">Port</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  placeholder="587"
                  value={settings.smtpPort}
                  onChange={(e) => updateSetting("smtpPort", parseInt(e.target.value) || 587)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtpUser">Benutzername</Label>
                <Input
                  id="smtpUser"
                  placeholder="user@example.com"
                  value={settings.smtpUser}
                  onChange={(e) => updateSetting("smtpUser", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">Passwort</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  placeholder="••••••••"
                  value={settings.smtpPassword}
                  onChange={(e) => updateSetting("smtpPassword", e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="smtpSecure"
                checked={settings.smtpSecure}
                onCheckedChange={(checked: boolean) => updateSetting("smtpSecure", checked)}
              />
              <Label htmlFor="smtpSecure">SSL/TLS verwenden</Label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="emailFrom">Absender E-Mail</Label>
                <Input
                  id="emailFrom"
                  type="email"
                  placeholder="shop@example.com"
                  value={settings.emailFrom}
                  onChange={(e) => updateSetting("emailFrom", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailFromName">Absender Name</Label>
                <Input
                  id="emailFromName"
                  placeholder="RealCore Shop"
                  value={settings.emailFromName}
                  onChange={(e) => updateSetting("emailFromName", e.target.value)}
                />
              </div>
            </div>

            {/* Test Email Section */}
            <div className="pt-4 border-t">
              <Label className="text-sm font-medium mb-2 block">Test-E-Mail senden</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={handleSendTestEmail} 
                  disabled={sendingTest || !settings.smtpHost}
                >
                  {sendingTest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Testen
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Sendet eine Test-E-Mail um die SMTP-Konfiguration zu prüfen
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Benachrichtigungen
            </CardTitle>
            <CardDescription>Wann sollen E-Mails versendet werden?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin E-Mail für Benachrichtigungen</Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@example.com"
                value={settings.adminEmail}
                onChange={(e) => updateSetting("adminEmail", e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifyOnOrder"
                  checked={settings.notifyOnOrder}
                  onCheckedChange={(checked: boolean) => updateSetting("notifyOnOrder", checked)}
                />
                <Label htmlFor="notifyOnOrder">Bei neuer Bestellung benachrichtigen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifyOnShipment"
                  checked={settings.notifyOnShipment}
                  onCheckedChange={(checked: boolean) => updateSetting("notifyOnShipment", checked)}
                />
                <Label htmlFor="notifyOnShipment">Bei Versand Kunden benachrichtigen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifyOnFeedback"
                  checked={settings.notifyOnFeedback}
                  onCheckedChange={(checked: boolean) => updateSetting("notifyOnFeedback", checked)}
                />
                <Label htmlFor="notifyOnFeedback">Bei neuem Feedback benachrichtigen</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Speichern...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Einstellungen speichern
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { getAdminApiErrorMessage } from "@/lib/admin-client"
import { Loader2, Plus, Trash2, GripVertical, Building, Save } from "lucide-react"

interface CompanyArea {
  id: string
  name: string
  isActive: boolean
  sortOrder: number
  costCenter: string | null
}

export function AdminCompanyAreas() {
  const [companyAreas, setCompanyAreas] = useState<CompanyArea[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newAreaName, setNewAreaName] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchCompanyAreas()
  }, [])

  const fetchCompanyAreas = async () => {
    try {
      const response = await fetch("/api/company-areas?all=true", {
        cache: "no-store",
      })
      if (!response.ok) {
        setMessage({
          type: "error",
          text: await getAdminApiErrorMessage(response, "Firmenbereiche konnten nicht geladen werden"),
        })
        return
      }
      const data = await response.json()
      setCompanyAreas(data)
    } catch (error) {
      console.error("Failed to fetch company areas:", error)
      setMessage({ type: "error", text: "Verbindungsfehler beim Laden der Firmenbereiche" })
    } finally {
      setLoading(false)
    }
  }

  const handleAddArea = async () => {
    if (!newAreaName.trim()) return
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/company-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newAreaName.trim(),
          sortOrder: companyAreas.length,
        }),
      })

      if (response.ok) {
        setNewAreaName("")
        setMessage({ type: "success", text: "Firmenbereich hinzugefügt" })
        await fetchCompanyAreas()
      } else {
        setMessage({
          type: "error",
          text: await getAdminApiErrorMessage(response, "Fehler beim Hinzufügen"),
        })
      }
    } catch {
      setMessage({ type: "error", text: "Verbindungsfehler" })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateArea = async (area: CompanyArea) => {
    try {
      const response = await fetch("/api/company-areas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(area),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Firmenbereich aktualisiert" })
        await fetchCompanyAreas()
      } else {
        setMessage({
          type: "error",
          text: await getAdminApiErrorMessage(response, "Fehler beim Aktualisieren"),
        })
      }
    } catch {
      setMessage({ type: "error", text: "Verbindungsfehler" })
    }
  }

  const handleDeleteArea = async (id: string) => {
    if (!confirm("Firmenbereich wirklich löschen?")) return

    try {
      const response = await fetch(`/api/company-areas?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Firmenbereich gelöscht" })
        await fetchCompanyAreas()
      } else {
        setMessage({
          type: "error",
          text: await getAdminApiErrorMessage(response, "Fehler beim Löschen"),
        })
      }
    } catch {
      setMessage({ type: "error", text: "Verbindungsfehler" })
    }
  }

  const handleToggleActive = (area: CompanyArea) => {
    handleUpdateArea({ ...area, isActive: !area.isActive })
  }

  const handleNameChange = (id: string, newName: string) => {
    setCompanyAreas(areas => 
      areas.map(a => a.id === id ? { ...a, name: newName } : a)
    )
  }

  const handleSaveName = (area: CompanyArea) => {
    if (area.name.trim()) {
      handleUpdateArea(area)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Firmenbereiche
        </CardTitle>
        <CardDescription>
          Verwalte die verfügbaren Firmenbereiche für die Mitarbeiterregistrierung
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message.text}
          </div>
        )}

        {/* Neuen Bereich hinzufügen */}
        <div className="flex gap-2">
          <Input
            placeholder="Neuer Firmenbereich..."
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddArea()}
          />
          <Button onClick={handleAddArea} disabled={saving || !newAreaName.trim()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline">Hinzufügen</span>
          </Button>
        </div>

        {/* Liste der Bereiche */}
        <div className="space-y-2">
          {companyAreas.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Noch keine Firmenbereiche angelegt
            </p>
          ) : (
            companyAreas.map((area) => (
              <div
                key={area.id}
                className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                
                <Input
                  value={area.name}
                  onChange={(e) => handleNameChange(area.id, e.target.value)}
                  onBlur={() => handleSaveName(area)}
                  className="flex-1"
                  placeholder="Bereichsname"
                />
                
                <Input
                  value={area.costCenter || ""}
                  onChange={(e) => {
                    setCompanyAreas(areas => 
                      areas.map(a => a.id === area.id ? { ...a, costCenter: e.target.value } : a)
                    )
                  }}
                  onBlur={() => handleUpdateArea(area)}
                  className="w-32"
                  placeholder="Kostenstelle"
                />
                
                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${area.id}`} className="text-sm text-muted-foreground">
                    Aktiv
                  </Label>
                  <Switch
                    id={`active-${area.id}`}
                    checked={area.isActive}
                    onCheckedChange={() => handleToggleActive(area)}
                  />
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteArea(area.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Nur aktive Firmenbereiche werden bei der Registrierung angezeigt.
        </p>
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getAdminApiErrorMessage } from "@/lib/admin-client"
import { appTextSections, type AppTextAdminEntry, type AppTextSection } from "@/lib/app-texts"
import { Copy, Loader2, RefreshCcw, Save, Search } from "lucide-react"
import { toast } from "sonner"

type SectionFilter = "all" | AppTextSection
type StatusFilter = "all" | "customized" | "unsaved"

type AdminTextResponse = {
  entries?: AppTextAdminEntry[]
}

function isCustomized(entry: AppTextAdminEntry) {
  return entry.values.de !== entry.defaults.de || entry.values.en !== entry.defaults.en
}

function cloneEntries(entries: AppTextAdminEntry[]) {
  return entries.map((entry) => ({
    ...entry,
    defaults: {
      ...entry.defaults,
    },
    values: {
      ...entry.values,
    },
  }))
}

export function AdminAppTexts() {
  const [entries, setEntries] = useState<AppTextAdminEntry[]>([])
  const [savedEntries, setSavedEntries] = useState<AppTextAdminEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [section, setSection] = useState<SectionFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const loadEntries = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/admin/crm/content/texts", {
        cache: "no-store",
      })

      if (!response.ok) {
        toast.error(await getAdminApiErrorMessage(response, "App-Texte konnten nicht geladen werden"))
        return
      }

      const data = (await response.json()) as AdminTextResponse
      const nextEntries = data.entries || []
      setEntries(cloneEntries(nextEntries))
      setSavedEntries(cloneEntries(nextEntries))
    } catch (error) {
      console.error("Failed to load admin app texts:", error)
      toast.error("Verbindungsfehler beim Laden der App-Texte")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadEntries()
  }, [])

  const savedEntriesByKey = useMemo(() => {
    return new Map(savedEntries.map((entry) => [entry.key, entry]))
  }, [savedEntries])

  const unsavedCount = useMemo(() => {
    return entries.filter((entry) => {
      const savedEntry = savedEntriesByKey.get(entry.key)
      return !savedEntry || entry.values.de !== savedEntry.values.de || entry.values.en !== savedEntry.values.en
    }).length
  }, [entries, savedEntriesByKey])

  const filteredEntries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return entries.filter((entry) => {
      const matchesSection = section === "all" || entry.section === section
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "customized" && isCustomized(entry)) ||
        (statusFilter === "unsaved" && (() => {
          const savedEntry = savedEntriesByKey.get(entry.key)
          return !savedEntry || entry.values.de !== savedEntry.values.de || entry.values.en !== savedEntry.values.en
        })())
      const matchesSearch =
        normalizedSearch.length === 0 ||
        entry.key.toLowerCase().includes(normalizedSearch) ||
        entry.label.toLowerCase().includes(normalizedSearch) ||
        entry.values.de.toLowerCase().includes(normalizedSearch) ||
        entry.values.en.toLowerCase().includes(normalizedSearch)

      return matchesSection && matchesStatus && matchesSearch
    })
  }, [entries, savedEntriesByKey, searchTerm, section, statusFilter])

  const customizedCount = useMemo(() => entries.filter(isCustomized).length, [entries])

  const hasUnsavedChanges = useMemo(() => {
    return unsavedCount > 0
  }, [unsavedCount])

  const handleValueChange = (key: string, language: "de" | "en", value: string) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.key === key
          ? {
              ...entry,
              values: {
                ...entry.values,
                [language]: value,
              },
            }
          : entry,
      ),
    )
  }

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      toast.success("Text-Key kopiert")
    } catch {
      toast.error("Text-Key konnte nicht kopiert werden")
    }
  }

  const handleResetEntry = (key: string) => {
    setEntries((current) =>
      current.map((entry) =>
        entry.key === key
          ? {
              ...entry,
              values: {
                de: entry.defaults.de,
                en: entry.defaults.en,
              },
            }
          : entry,
      ),
    )
  }

  const handleResetAll = () => {
    setEntries((current) =>
      current.map((entry) => ({
        ...entry,
        values: {
          de: entry.defaults.de,
          en: entry.defaults.en,
        },
      })),
    )
  }

  const handleDiscardChanges = () => {
    setEntries(cloneEntries(savedEntries))
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const response = await fetch("/api/admin/crm/content/texts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entries: entries.map((entry) => ({
            key: entry.key,
            values: entry.values,
          })),
        }),
      })

      if (!response.ok) {
        toast.error(await getAdminApiErrorMessage(response, "App-Texte konnten nicht gespeichert werden"))
        return
      }

      const data = (await response.json()) as AdminTextResponse
      const nextEntries = data.entries || []
      setEntries(cloneEntries(nextEntries))
      setSavedEntries(cloneEntries(nextEntries))
      toast.success("App-Texte gespeichert")
    } catch (error) {
      console.error("Failed to save admin app texts:", error)
      toast.error("Verbindungsfehler beim Speichern der App-Texte")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">App-Texte</h2>
          <p className="text-muted-foreground">Pflege zentrale sichtbare Texte für Shop, Warenkorb und Bestellfluss in Deutsch und Englisch.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void loadEntries()} disabled={loading || saving}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Neu laden
          </Button>
          <Button variant="outline" onClick={handleDiscardChanges} disabled={loading || saving || !hasUnsavedChanges}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Änderungen verwerfen
          </Button>
          <Button variant="outline" onClick={handleResetAll} disabled={loading || saving || entries.length === 0}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Alles auf Standard
          </Button>
          <Button onClick={handleSave} disabled={loading || saving || !hasUnsavedChanges}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Änderungen speichern
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{entries.length}</div>
            <div className="text-sm text-muted-foreground">Registrierte Texte</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customizedCount}</div>
            <div className="text-sm text-muted-foreground">Individuell überschrieben</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{unsavedCount}</div>
            <div className="text-sm text-muted-foreground">Ungespeicherte Änderungen</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{Object.keys(appTextSections).length}</div>
            <div className="text-sm text-muted-foreground">Text-Bereiche</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter</CardTitle>
          <CardDescription>{filteredEntries.length} Treffer für die aktuelle Filterkombination.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[1fr_240px_240px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Suche nach Key oder Text..." className="pl-9" />
          </div>
          <Select value={section} onValueChange={(value) => setSection(value as SectionFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Bereich wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Bereiche</SelectItem>
              {Object.entries(appTextSections).map(([sectionKey, label]) => (
                <SelectItem key={sectionKey} value={sectionKey}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Status wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Stati</SelectItem>
              <SelectItem value="customized">Nur überschrieben</SelectItem>
              <SelectItem value="unsaved">Nur ungespeichert</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          Keine App-Texte für den aktuellen Filter gefunden.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.key}>
              <CardHeader className="gap-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{entry.label}</CardTitle>
                      <Badge variant="outline">{entry.sectionLabel}</Badge>
                      {isCustomized(entry) && <Badge>Überschrieben</Badge>}
                      {(() => {
                        const savedEntry = savedEntriesByKey.get(entry.key)
                        const isUnsaved = !savedEntry || entry.values.de !== savedEntry.values.de || entry.values.en !== savedEntry.values.en
                        return isUnsaved ? <Badge variant="secondary">Ungespeichert</Badge> : null
                      })()}
                    </div>
                    <CardDescription className="font-mono text-xs">{entry.key}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => void handleCopyKey(entry.key)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Key kopieren
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleResetEntry(entry.key)}>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Auf Standard
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`${entry.key}-de`}>Deutsch</Label>
                    <Textarea
                      id={`${entry.key}-de`}
                      rows={3}
                      value={entry.values.de}
                      onChange={(event) => handleValueChange(entry.key, "de", event.target.value)}
                    />
                  </div>
                  <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Standard:</span> {entry.defaults.de}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`${entry.key}-en`}>English</Label>
                    <Textarea
                      id={`${entry.key}-en`}
                      rows={3}
                      value={entry.values.en}
                      onChange={(event) => handleValueChange(entry.key, "en", event.target.value)}
                    />
                  </div>
                  <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Default:</span> {entry.defaults.en}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

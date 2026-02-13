"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Plus, Pencil, Trash2, Key, Copy, Check, Building2 } from "lucide-react"
import { toast } from "sonner"

interface Supplier {
  id: string
  companyName: string
  email: string
  phone?: string
  contactPerson?: string
  address?: string
  apiActive: boolean
  apiKey?: string
  portalActive: boolean
  portalUsername?: string
  webhookUrl?: string
  isActive: boolean
  createdAt: string
  _count?: {
    orderItems: number
  }
}

export function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [saving, setSaving] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    contactPerson: "",
    address: "",
    apiActive: false,
    portalActive: false,
    portalUsername: "",
    portalPassword: "",
    webhookUrl: "",
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/admin/suppliers")
      if (res.ok) {
        const data = await res.json()
        setSuppliers(data)
      }
    } catch (error) {
      console.error("Failed to fetch suppliers:", error)
      toast.error("Fehler beim Laden der Lieferanten")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      companyName: "",
      email: "",
      phone: "",
      contactPerson: "",
      address: "",
      apiActive: false,
      portalActive: false,
      portalUsername: "",
      portalPassword: "",
      webhookUrl: "",
    })
    setEditingSupplier(null)
  }

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      companyName: supplier.companyName,
      email: supplier.email,
      phone: supplier.phone || "",
      contactPerson: supplier.contactPerson || "",
      address: supplier.address || "",
      apiActive: supplier.apiActive,
      portalActive: supplier.portalActive,
      portalUsername: supplier.portalUsername || "",
      portalPassword: "",
      webhookUrl: supplier.webhookUrl || "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingSupplier
        ? `/api/admin/suppliers/${editingSupplier.id}`
        : "/api/admin/suppliers"
      const method = editingSupplier ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast.success(editingSupplier ? "Lieferant aktualisiert" : "Lieferant erstellt")
        setDialogOpen(false)
        resetForm()
        fetchSuppliers()
      } else {
        const data = await res.json()
        toast.error(data.error || "Fehler beim Speichern")
      }
    } catch (error) {
      console.error("Failed to save supplier:", error)
      toast.error("Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Lieferant wirklich deaktivieren?")) return

    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Lieferant deaktiviert")
        fetchSuppliers()
      } else {
        toast.error("Fehler beim Deaktivieren")
      }
    } catch (error) {
      console.error("Failed to delete supplier:", error)
      toast.error("Fehler beim Deaktivieren")
    }
  }

  const regenerateApiKey = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerateApiKey: true }),
      })
      if (res.ok) {
        toast.success("API-Key neu generiert")
        fetchSuppliers()
      }
    } catch (error) {
      console.error("Failed to regenerate API key:", error)
      toast.error("Fehler beim Generieren des API-Keys")
    }
  }

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
    toast.success("API-Key kopiert")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lieferanten</h1>
          <p className="text-muted-foreground">Verwaltung der Lieferanten und API-Zugänge</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Lieferant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? "Lieferant bearbeiten" : "Neuer Lieferant"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Firmenname *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Ansprechpartner</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-4">API-Zugang</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>API aktiviert</Label>
                      <p className="text-sm text-muted-foreground">
                        Ermöglicht Zugriff per REST-API
                      </p>
                    </div>
                    <Switch
                      checked={formData.apiActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, apiActive: checked })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook-URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://..."
                      value={formData.webhookUrl}
                      onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-4">Portal-Zugang</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Portal aktiviert</Label>
                      <p className="text-sm text-muted-foreground">
                        Ermöglicht Login im Lieferanten-Portal
                      </p>
                    </div>
                    <Switch
                      checked={formData.portalActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, portalActive: checked })}
                    />
                  </div>
                  {formData.portalActive && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="portalUsername">Benutzername</Label>
                        <Input
                          id="portalUsername"
                          value={formData.portalUsername}
                          onChange={(e) => setFormData({ ...formData, portalUsername: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="portalPassword">
                          {editingSupplier ? "Neues Passwort (leer lassen)" : "Passwort"}
                        </Label>
                        <Input
                          id="portalPassword"
                          type="password"
                          value={formData.portalPassword}
                          onChange={(e) => setFormData({ ...formData, portalPassword: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingSupplier ? "Speichern" : "Erstellen"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Alle Lieferanten ({suppliers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Lieferanten angelegt
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firma</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead>API</TableHead>
                  <TableHead>Portal</TableHead>
                  <TableHead>Bestellungen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.companyName}</p>
                        <p className="text-sm text-muted-foreground">{supplier.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {supplier.contactPerson && (
                        <p className="text-sm">{supplier.contactPerson}</p>
                      )}
                      {supplier.phone && (
                        <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {supplier.apiActive ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Aktiv
                          </Badge>
                          {supplier.apiKey && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyApiKey(supplier.apiKey!)}
                            >
                              {copiedKey === supplier.apiKey ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Inaktiv
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {supplier.portalActive ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {supplier.portalUsername || "Aktiv"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Inaktiv
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {supplier._count?.orderItems || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {supplier.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
                      ) : (
                        <Badge variant="destructive">Deaktiviert</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {supplier.apiActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => regenerateApiKey(supplier.id)}
                            title="API-Key neu generieren"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(supplier)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(supplier.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

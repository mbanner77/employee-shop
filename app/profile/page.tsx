"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, User, MapPin, Bell, Plus, Pencil, Trash2, ArrowLeft, Check } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Address {
  id: string
  type: string
  label?: string
  street: string
  city: string
  zip: string
  country: string
  isDefault: boolean
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  notifyStatusUpdates: boolean
  notifyNewsletter: boolean
  notifyWishlistAvailable: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  const [addressForm, setAddressForm] = useState({
    type: "SHIPPING",
    label: "",
    street: "",
    city: "",
    zip: "",
    country: "Deutschland",
    isDefault: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [empRes, addrRes] = await Promise.all([
        fetch("/api/employees/me"),
        fetch("/api/employees/me/addresses"),
      ])

      if (empRes.status === 401) {
        router.push("/")
        return
      }

      if (empRes.ok) {
        const empData = await empRes.json()
        setEmployee(empData.employee || empData)
      }

      if (addrRes.ok) {
        const addrData = await addrRes.json()
        setAddresses(addrData)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationChange = async (field: string, value: boolean) => {
    if (!employee) return
    setSavingNotifications(true)

    try {
      const res = await fetch("/api/employees/me/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      })

      if (res.ok) {
        setEmployee({ ...employee, [field]: value })
        toast.success("Einstellungen gespeichert")
      } else {
        toast.error("Fehler beim Speichern")
      }
    } catch (error) {
      console.error("Failed to update notifications:", error)
      toast.error("Fehler beim Speichern")
    } finally {
      setSavingNotifications(false)
    }
  }

  const resetAddressForm = () => {
    setAddressForm({
      type: "SHIPPING",
      label: "",
      street: "",
      city: "",
      zip: "",
      country: "Deutschland",
      isDefault: false,
    })
    setEditingAddress(null)
  }

  const openEditAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      type: address.type,
      label: address.label || "",
      street: address.street,
      city: address.city,
      zip: address.zip,
      country: address.country,
      isDefault: address.isDefault,
    })
    setAddressDialogOpen(true)
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingAddress(true)

    try {
      const method = editingAddress ? "PUT" : "POST"
      const body = editingAddress
        ? { id: editingAddress.id, ...addressForm }
        : addressForm

      const res = await fetch("/api/employees/me/addresses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast.success(editingAddress ? "Adresse aktualisiert" : "Adresse hinzugefügt")
        setAddressDialogOpen(false)
        resetAddressForm()
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || "Fehler beim Speichern")
      }
    } catch (error) {
      console.error("Failed to save address:", error)
      toast.error("Fehler beim Speichern")
    } finally {
      setSavingAddress(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Adresse wirklich löschen?")) return

    try {
      const res = await fetch("/api/employees/me/addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        toast.success("Adresse gelöscht")
        fetchData()
      } else {
        toast.error("Fehler beim Löschen")
      }
    } catch (error) {
      console.error("Failed to delete address:", error)
      toast.error("Fehler beim Löschen")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  const addressTypeLabels: Record<string, string> = {
    SHIPPING: "Lieferadresse",
    BILLING: "Rechnungsadresse",
    OFFICE: "Büroadresse",
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zum Shop
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Mein Profil</h1>
          <p className="text-muted-foreground">Verwalte deine Einstellungen und Adressen</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Persönliche Daten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground text-xs">Vorname</Label>
                  <p className="font-medium">{employee?.firstName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Nachname</Label>
                  <p className="font-medium">{employee?.lastName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">E-Mail</Label>
                  <p className="font-medium">{employee?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Abteilung</Label>
                  <p className="font-medium">{employee?.department}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Benachrichtigungen
              </CardTitle>
              <CardDescription>
                Wähle aus, worüber du informiert werden möchtest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Bestellstatus</p>
                  <p className="text-sm text-muted-foreground">
                    Updates zu deinen Bestellungen
                  </p>
                </div>
                <Switch
                  checked={employee?.notifyStatusUpdates ?? true}
                  onCheckedChange={(checked) => handleNotificationChange("notifyStatusUpdates", checked)}
                  disabled={savingNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Wunschliste</p>
                  <p className="text-sm text-muted-foreground">
                    Wenn Artikel wieder verfügbar sind
                  </p>
                </div>
                <Switch
                  checked={employee?.notifyWishlistAvailable ?? true}
                  onCheckedChange={(checked) => handleNotificationChange("notifyWishlistAvailable", checked)}
                  disabled={savingNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Newsletter</p>
                  <p className="text-sm text-muted-foreground">
                    Neuigkeiten und Aktionen
                  </p>
                </div>
                <Switch
                  checked={employee?.notifyNewsletter ?? false}
                  onCheckedChange={(checked) => handleNotificationChange("notifyNewsletter", checked)}
                  disabled={savingNotifications}
                />
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Meine Adressen
                </CardTitle>
                <CardDescription>
                  Verwalte deine Liefer- und Rechnungsadressen
                </CardDescription>
              </div>
              <Dialog open={addressDialogOpen} onOpenChange={(open) => {
                setAddressDialogOpen(open)
                if (!open) resetAddressForm()
              }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Neue Adresse
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAddress ? "Adresse bearbeiten" : "Neue Adresse"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddressSubmit} className="space-y-4 mt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Typ</Label>
                        <Select
                          value={addressForm.type}
                          onValueChange={(value) => setAddressForm({ ...addressForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SHIPPING">Lieferadresse</SelectItem>
                            <SelectItem value="BILLING">Rechnungsadresse</SelectItem>
                            <SelectItem value="OFFICE">Büroadresse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Bezeichnung (optional)</Label>
                        <Input
                          placeholder="z.B. Zuhause, Büro"
                          value={addressForm.label}
                          onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Straße & Hausnummer *</Label>
                      <Input
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>PLZ *</Label>
                        <Input
                          value={addressForm.zip}
                          onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Stadt *</Label>
                        <Input
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Land</Label>
                      <Input
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={addressForm.isDefault}
                        onCheckedChange={(checked) => setAddressForm({ ...addressForm, isDefault: checked })}
                      />
                      <Label>Als Standardadresse verwenden</Label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setAddressDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button type="submit" disabled={savingAddress}>
                        {savingAddress && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Speichern
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Noch keine Adressen gespeichert
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 border rounded-lg relative group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {addressTypeLabels[address.type] || address.type}
                          </Badge>
                          {address.isDefault && (
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Standard
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditAddress(address)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {address.label && (
                        <p className="font-medium mb-1">{address.label}</p>
                      )}
                      <p className="text-sm">{address.street}</p>
                      <p className="text-sm">{address.zip} {address.city}</p>
                      <p className="text-sm text-muted-foreground">{address.country}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

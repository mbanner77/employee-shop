"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppTexts } from "@/components/app-text-provider"
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
import { Loader2, User, MapPin, Bell, Plus, Pencil, Trash2, ArrowLeft, Check, Lock } from "lucide-react"
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
  const { text } = useAppTexts()
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", department: "" })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [addressForm, setAddressForm] = useState({
    type: "PRIVATE",
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
        toast.success(text("profile.toast.saved"))
      } else {
        toast.error(text("profile.toast.saveError"))
      }
    } catch (error) {
      console.error("Failed to update notifications:", error)
      toast.error(text("profile.toast.saveError"))
    } finally {
      setSavingNotifications(false)
    }
  }

  const resetAddressForm = () => {
    setAddressForm({
      type: "PRIVATE",
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
        toast.success(editingAddress ? text("profile.addresses.savedEdit") : text("profile.addresses.savedNew"))
        setAddressDialogOpen(false)
        resetAddressForm()
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || text("profile.toast.saveError"))
      }
    } catch (error) {
      console.error("Failed to save address:", error)
      toast.error(text("profile.toast.saveError"))
    } finally {
      setSavingAddress(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm(text("profile.addresses.deleteConfirm"))) return

    try {
      const res = await fetch("/api/employees/me/addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        toast.success(text("profile.addresses.deleted"))
        fetchData()
      } else {
        toast.error(text("profile.addresses.deleteError"))
      }
    } catch (error) {
      console.error("Failed to delete address:", error)
      toast.error(text("profile.addresses.deleteError"))
    }
  }

  const startEditingProfile = () => {
    if (employee) {
      setProfileForm({
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: employee.department,
      })
      setEditingProfile(true)
    }
  }

  const handleProfileSave = async () => {
    setSavingProfile(true)
    try {
      const res = await fetch("/api/employees/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      })
      const data = await res.json()
      if (res.ok) {
        setEmployee(data.employee)
        setEditingProfile(false)
        toast.success("Profil gespeichert")
      } else {
        toast.error(data.error || "Fehler beim Speichern")
      }
    } catch (error) {
      console.error("Failed to save profile:", error)
      toast.error("Fehler beim Speichern")
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Die Passwörter stimmen nicht überein")
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Das neue Passwort muss mindestens 6 Zeichen lang sein")
      return
    }
    setSavingPassword(true)
    try {
      const res = await fetch("/api/employees/me/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || "Passwort geändert")
        setPasswordDialogOpen(false)
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        toast.error(data.error || "Fehler beim Ändern des Passworts")
      }
    } catch (error) {
      console.error("Failed to change password:", error)
      toast.error("Fehler beim Ändern des Passworts")
    } finally {
      setSavingPassword(false)
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
    PRIVATE: text("profile.addresses.typePrivate"),
    COMPANY: text("profile.addresses.typeCompany"),
    OTHER: text("profile.addresses.typeOther"),
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {text("profile.back")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{text("profile.title")}</h1>
          <p className="text-muted-foreground">{text("profile.description")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {text("profile.personal.title")}
              </CardTitle>
              {!editingProfile && (
                <Button variant="ghost" size="sm" onClick={startEditingProfile}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {editingProfile ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{text("profile.firstName")}</Label>
                      <Input
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{text("profile.lastName")}</Label>
                      <Input
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{text("profile.email")}</Label>
                      <Input value={employee?.email} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                      <Label>{text("profile.department")}</Label>
                      <Input
                        value={profileForm.department}
                        onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setEditingProfile(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleProfileSave} disabled={savingProfile}>
                      {savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Speichern
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground text-xs">{text("profile.firstName")}</Label>
                    <p className="font-medium">{employee?.firstName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">{text("profile.lastName")}</Label>
                    <p className="font-medium">{employee?.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">{text("profile.email")}</Label>
                    <p className="font-medium">{employee?.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">{text("profile.department")}</Label>
                    <p className="font-medium">{employee?.department}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Passwort
              </CardTitle>
              <CardDescription>Ändere dein Passwort für den Login</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={passwordDialogOpen} onOpenChange={(open) => {
                setPasswordDialogOpen(open)
                if (!open) setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Lock className="h-4 w-4 mr-2" />
                    Passwort ändern
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Passwort ändern</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Aktuelles Passwort</Label>
                      <Input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Neues Passwort</Label>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        minLength={6}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Neues Passwort bestätigen</Label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        minLength={6}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button type="submit" disabled={savingPassword}>
                        {savingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Passwort ändern
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {text("profile.notifications.title")}
              </CardTitle>
              <CardDescription>
                {text("profile.notifications.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{text("profile.notifications.orderStatus.title")}</p>
                  <p className="text-sm text-muted-foreground">
                    {text("profile.notifications.orderStatus.description")}
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
                  <p className="font-medium">{text("profile.notifications.wishlist.title")}</p>
                  <p className="text-sm text-muted-foreground">
                    {text("profile.notifications.wishlist.description")}
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
                  <p className="font-medium">{text("profile.notifications.newsletter.title")}</p>
                  <p className="text-sm text-muted-foreground">
                    {text("profile.notifications.newsletter.description")}
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
                  {text("profile.addresses.title")}
                </CardTitle>
                <CardDescription>
                  {text("profile.addresses.description")}
                </CardDescription>
              </div>
              <Dialog open={addressDialogOpen} onOpenChange={(open) => {
                setAddressDialogOpen(open)
                if (!open) resetAddressForm()
              }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {text("profile.addresses.new")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAddress ? text("profile.addresses.edit") : text("profile.addresses.new")}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddressSubmit} className="space-y-4 mt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{text("profile.addresses.type")}</Label>
                        <Select
                          value={addressForm.type}
                          onValueChange={(value) => setAddressForm({ ...addressForm, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRIVATE">{text("profile.addresses.typePrivate")}</SelectItem>
                            <SelectItem value="COMPANY">{text("profile.addresses.typeCompany")}</SelectItem>
                            <SelectItem value="OTHER">{text("profile.addresses.typeOther")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{text("profile.addresses.label")}</Label>
                        <Input
                          placeholder={text("profile.addresses.labelPlaceholder")}
                          value={addressForm.label}
                          onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{text("profile.addresses.street")}</Label>
                      <Input
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{text("profile.addresses.zip")}</Label>
                        <Input
                          value={addressForm.zip}
                          onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{text("profile.addresses.city")}</Label>
                        <Input
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{text("profile.addresses.country")}</Label>
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
                      <Label>{text("profile.addresses.default")}</Label>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setAddressDialogOpen(false)}>
                        {text("profile.addresses.cancel")}
                      </Button>
                      <Button type="submit" disabled={savingAddress}>
                        {savingAddress && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {text("profile.addresses.save")}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {text("profile.addresses.empty")}
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
                              {text("profile.addresses.defaultBadge")}
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

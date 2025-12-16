"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Pencil, Trash2, Truck, Eye, EyeOff, Shield } from "lucide-react"

interface User {
  id: string
  username: string
  createdAt: string
}

type UserType = "supplier" | "admin"

export function AdminUsers() {
  const [supplierUsers, setSupplierUsers] = useState<User[]>([])
  const [adminUsers, setAdminUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingType, setEditingType] = useState<UserType>("supplier")
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<UserType>("supplier")

  useEffect(() => {
    fetchAllUsers()
  }, [])

  const fetchAllUsers = async () => {
    try {
      const [supplierRes, adminRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/admins"),
      ])
      if (supplierRes.ok) {
        const data = await supplierRes.json()
        setSupplierUsers(data)
      }
      if (adminRes.ok) {
        const data = await adminRes.json()
        setAdminUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = (type: UserType) => {
    setEditingUser(null)
    setEditingType(type)
    setFormData({ username: "", password: "" })
    setError("")
    setDialogOpen(true)
  }

  const openEditDialog = (user: User, type: UserType) => {
    setEditingUser(user)
    setEditingType(type)
    setFormData({ username: user.username, password: "" })
    setError("")
    setDialogOpen(true)
  }

  const getApiPath = (type: UserType) => type === "admin" ? "/api/admin/admins" : "/api/admin/users"

  const handleSave = async () => {
    setError("")
    setSaving(true)

    const apiPath = getApiPath(editingType)

    try {
      if (editingUser) {
        // Update existing user
        const updateData: { username?: string; password?: string } = {}
        if (formData.username !== editingUser.username) {
          updateData.username = formData.username
        }
        if (formData.password) {
          updateData.password = formData.password
        }

        const response = await fetch(`${apiPath}/${editingUser.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || "Fehler beim Speichern")
          return
        }
      } else {
        // Create new user
        if (!formData.username || !formData.password) {
          setError("Benutzername und Passwort erforderlich")
          return
        }

        const response = await fetch(apiPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const data = await response.json()
          setError(data.error || "Fehler beim Erstellen")
          return
        }
      }

      setDialogOpen(false)
      fetchAllUsers()
    } catch {
      setError("Verbindungsfehler")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: User, type: UserType) => {
    const label = type === "admin" ? "Administrator" : "Lieferant"
    if (!confirm(`${label} "${user.username}" wirklich löschen?`)) return

    try {
      const apiPath = getApiPath(type)
      const response = await fetch(`${apiPath}/${user.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchAllUsers()
      } else {
        const data = await response.json()
        alert(data.error || "Fehler beim Löschen")
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const renderUserList = (users: User[], type: UserType) => {
    const Icon = type === "admin" ? Shield : Truck
    const label = type === "admin" ? "Administrator" : "Lieferant"
    const emptyText = type === "admin" ? "Keine Administratoren angelegt" : "Keine Lieferanten angelegt"

    return (
      <div className="space-y-3">
        {users.length === 0 ? (
          <Card>
            <CardContent className="flex h-32 items-center justify-center">
              <p className="text-muted-foreground">{emptyText}</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">
                        Erstellt am {new Date(user.createdAt).toLocaleDateString("de-DE")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(user, type)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user, type)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Benutzerverwaltung</h1>
        <p className="text-muted-foreground">Verwalte Admin- und Lieferanten-Zugänge</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{adminUsers.length}</div>
                <div className="text-sm text-muted-foreground">Admin-Accounts</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Truck className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{supplierUsers.length}</div>
                <div className="text-sm text-muted-foreground">Lieferanten-Accounts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for User Types */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as UserType)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="supplier" className="gap-2">
              <Truck className="h-4 w-4" />
              Lieferanten
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Shield className="h-4 w-4" />
              Administratoren
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => openCreateDialog(activeTab)}>
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === "admin" ? "Neuer Admin" : "Neuer Lieferant"}
          </Button>
        </div>

        <TabsContent value="supplier" className="mt-4">
          {renderUserList(supplierUsers, "supplier")}
        </TabsContent>

        <TabsContent value="admin" className="mt-4">
          {renderUserList(adminUsers, "admin")}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser 
                ? (editingType === "admin" ? "Administrator bearbeiten" : "Lieferant bearbeiten")
                : (editingType === "admin" ? "Neuer Administrator" : "Neuer Lieferant")
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Benutzername</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Benutzername eingeben"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {editingUser ? "Neues Passwort (leer lassen zum Beibehalten)" : "Passwort"}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? "Neues Passwort" : "Passwort eingeben"}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-950 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingUser ? "Speichern" : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Plus, Pencil, Trash2, Truck, Eye, EyeOff } from "lucide-react"

interface SupplierUser {
  id: string
  username: string
  createdAt: string
}

export function AdminUsers() {
  const [users, setUsers] = useState<SupplierUser[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SupplierUser | null>(null)
  const [formData, setFormData] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingUser(null)
    setFormData({ username: "", password: "" })
    setError("")
    setDialogOpen(true)
  }

  const openEditDialog = (user: SupplierUser) => {
    setEditingUser(user)
    setFormData({ username: user.username, password: "" })
    setError("")
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setError("")
    setSaving(true)

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

        const response = await fetch(`/api/admin/users/${editingUser.id}`, {
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

        const response = await fetch("/api/admin/users", {
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
      fetchUsers()
    } catch {
      setError("Verbindungsfehler")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: SupplierUser) => {
    if (!confirm(`Lieferant "${user.username}" wirklich löschen?`)) return

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Benutzerverwaltung</h1>
          <p className="text-muted-foreground">Verwalte Lieferanten-Zugänge für den Shop</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Lieferant
        </Button>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Truck className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-muted-foreground">Lieferanten-Accounts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <div className="space-y-3">
        {users.length === 0 ? (
          <Card>
            <CardContent className="flex h-32 items-center justify-center">
              <p className="text-muted-foreground">Keine Lieferanten angelegt</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-muted-foreground">
                        Erstellt am {new Date(user.createdAt).toLocaleDateString("de-DE")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Lieferant bearbeiten" : "Neuer Lieferant"}
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
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

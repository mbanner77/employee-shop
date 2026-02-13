"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Heart, Trash2, ShoppingBag, Pencil, Bell, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { useShopStore } from "@/lib/store"

interface WishlistItem {
  id: string
  productId: string
  preferredSize?: string
  preferredColor?: string
  notes?: string
  notifyWhenAvailable: boolean
  notifiedAt?: string
  product: {
    id: string
    name: string
    category: string
    description: string
    image: string
    sizes: string[]
    colors?: string[]
    stock?: Record<string, number>
  }
}

export default function WishlistPage() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)
  const [saving, setSaving] = useState(false)
  const { addToCart, cart } = useShopStore()

  const [editForm, setEditForm] = useState({
    preferredSize: "",
    preferredColor: "",
    notes: "",
    notifyWhenAvailable: true,
  })

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist")
      if (res.status === 401) {
        router.push("/")
        return
      }
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error)
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (item: WishlistItem) => {
    setEditingItem(item)
    setEditForm({
      preferredSize: item.preferredSize || "",
      preferredColor: item.preferredColor || "",
      notes: item.notes || "",
      notifyWhenAvailable: item.notifyWhenAvailable,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingItem) return
    setSaving(true)

    try {
      const res = await fetch("/api/wishlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingItem.id,
          ...editForm,
        }),
      })

      if (res.ok) {
        toast.success("Wunschliste aktualisiert")
        setEditingItem(null)
        fetchWishlist()
      } else {
        toast.error("Fehler beim Speichern")
      }
    } catch (error) {
      console.error("Failed to update wishlist item:", error)
      toast.error("Fehler beim Speichern")
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        setItems(items.filter((i) => i.id !== id))
        toast.success("Von Wunschliste entfernt")
      }
    } catch (error) {
      console.error("Failed to remove item:", error)
      toast.error("Fehler beim Entfernen")
    }
  }

  const handleAddToCart = (item: WishlistItem) => {
    if (cart.length >= 4) {
      toast.error("Maximal 4 Artikel im Warenkorb")
      return
    }

    const size = item.preferredSize || item.product.sizes[0]
    addToCart(item.product as any, size as any)
    toast.success("In den Warenkorb gelegt")
  }

  const isInStock = (item: WishlistItem): boolean => {
    if (!item.product.stock) return true
    const size = item.preferredSize || item.product.sizes[0]
    const stock = item.product.stock[size]
    return stock !== undefined && stock > 0
  }

  const getStockInfo = (item: WishlistItem): string => {
    if (!item.product.stock) return "Verfügbar"
    const size = item.preferredSize || item.product.sizes[0]
    const stock = item.product.stock[size]
    if (stock === undefined) return "Unbekannt"
    if (stock === 0) return "Nicht verfügbar"
    if (stock <= 5) return `Nur noch ${stock}`
    return "Auf Lager"
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
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold">Meine Wunschliste</h1>
              <p className="text-muted-foreground">
                Speichere Artikel mit deinen bevorzugten Größen und Farben
              </p>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Wunschliste ist leer</h2>
              <p className="text-muted-foreground mb-6">
                Füge Artikel zu deiner Wunschliste hinzu, um sie später zu bestellen.
              </p>
              <Link href="/">
                <Button>Zur Kollektion</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} className="group overflow-hidden">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={item.product.image || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => openEditDialog(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {item.notifyWhenAvailable && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        <Bell className="h-3 w-3 mr-1" />
                        Benachrichtigung
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {item.product.category}
                  </div>
                  <h3 className="mb-2 font-semibold">{item.product.name}</h3>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.preferredSize && (
                      <Badge variant="outline">Größe: {item.preferredSize}</Badge>
                    )}
                    {item.preferredColor && (
                      <Badge variant="outline">Farbe: {item.preferredColor}</Badge>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      📝 {item.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm ${isInStock(item) ? "text-green-600" : "text-red-500"}`}>
                      {getStockInfo(item)}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleAddToCart(item)}
                    disabled={
                      !isInStock(item) ||
                      cart.some((c) => c.product.id === item.productId)
                    }
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {cart.some((c) => c.product.id === item.productId)
                      ? "Im Warenkorb"
                      : "In den Warenkorb"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Wunschlisten-Eintrag bearbeiten</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div className="relative h-16 w-16 rounded overflow-hidden">
                    <Image
                      src={editingItem.product.image || "/placeholder.svg"}
                      alt={editingItem.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{editingItem.product.name}</p>
                    <p className="text-sm text-muted-foreground">{editingItem.product.category}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Bevorzugte Größe</Label>
                    <Select
                      value={editForm.preferredSize}
                      onValueChange={(value) => setEditForm({ ...editForm, preferredSize: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Größe wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {editingItem.product.sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bevorzugte Farbe</Label>
                    {editingItem.product.colors && editingItem.product.colors.length > 0 ? (
                      <Select
                        value={editForm.preferredColor}
                        onValueChange={(value) => setEditForm({ ...editForm, preferredColor: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Farbe wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          {editingItem.product.colors.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="z.B. Navy, Schwarz"
                        value={editForm.preferredColor}
                        onChange={(e) => setEditForm({ ...editForm, preferredColor: e.target.value })}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notizen</Label>
                  <Textarea
                    placeholder="z.B. für Kollegin als Geschenk"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Benachrichtigen</p>
                    <p className="text-sm text-muted-foreground">
                      Wenn Artikel wieder verfügbar ist
                    </p>
                  </div>
                  <Switch
                    checked={editForm.notifyWhenAvailable}
                    onCheckedChange={(checked) =>
                      setEditForm({ ...editForm, notifyWhenAvailable: checked })
                    }
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditingItem(null)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Speichern
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

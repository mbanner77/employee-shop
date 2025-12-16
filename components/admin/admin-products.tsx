"use client"

import React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { type Product } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Plus, Search, ChevronLeft, ChevronRight, ImageIcon, Loader2, Upload, X, Trash2 } from "lucide-react"

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newDialogOpen, setNewDialogOpen] = useState(false)

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleProductSaved = () => {
    setNewDialogOpen(false)
    fetchProducts()
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
          <h1 className="text-2xl font-bold text-foreground">Produkte</h1>
          <p className="text-muted-foreground">Verwalte die Mitarbeiterkollektion</p>
        </div>
        <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neues Produkt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neues Produkt hinzufügen</DialogTitle>
            </DialogHeader>
            <ProductForm 
              onSuccess={handleProductSaved} 
              onCancel={() => setNewDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Produkte suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onRefresh={fetchProducts}
          />
        ))}
      </div>
    </div>
  )
}

// Single Product Card with Image Carousel
function ProductCard({ product, onRefresh }: { product: Product; onRefresh: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleSaved = () => {
    setEditDialogOpen(false)
    onRefresh()
  }

  const handleDelete = async () => {
    if (!confirm(`Produkt "${product.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" })
      if (response.ok) {
        onRefresh()
      } else {
        alert("Fehler beim Löschen des Produkts")
      }
    } catch (error) {
      console.error("Failed to delete product:", error)
      alert("Fehler beim Löschen des Produkts")
    } finally {
      setDeleting(false)
    }
  }
  
  const allImages = product.images && product.images.length > 0 
    ? [product.image, ...product.images] 
    : [product.image]

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-square">
        <Image 
          src={allImages[currentImageIndex] || "/placeholder.svg"} 
          alt={`${product.name} - Bild ${currentImageIndex + 1}`} 
          fill 
          className="object-cover" 
        />
        
        {/* Image count badge */}
        {allImages.length > 1 && (
          <Badge className="absolute top-2 left-2 bg-background/80 text-foreground">
            <ImageIcon className="h-3 w-3 mr-1" />
            {currentImageIndex + 1}/{allImages.length}
          </Badge>
        )}
        
        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background"
              aria-label="Vorheriges Bild"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background"
              aria-label="Nächstes Bild"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentImageIndex(index)
                  }}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? "bg-primary scale-110"
                      : "bg-background/60 hover:bg-background/80"
                  }`}
                  aria-label={`Bild ${index + 1} anzeigen`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="outline" className="mb-2">
              {product.category}
            </Badge>
            <CardTitle className="text-base">{product.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Produkt bearbeiten</DialogTitle>
                </DialogHeader>
                <ProductForm 
                  product={product} 
                  onSuccess={handleSaved}
                  onCancel={() => setEditDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex flex-wrap gap-1">
          {product.sizes.map((size) => (
            <Badge key={size} variant="secondary" className="text-xs">
              {size}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProductForm({ product, onSuccess, onCancel }: { product?: Product; onSuccess?: () => void; onCancel?: () => void }) {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || "",
    description: product?.description || "",
    color: product?.color || "",
    image: product?.image || "",
    sizes: product?.sizes?.join(", ") || "XS, S, M, L, XL, XXL",
    additionalImages: product?.images || [] as string[],
  })

  const allImages = formData.image 
    ? [formData.image, ...formData.additionalImages]
    : formData.additionalImages

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    
    try {
      for (const file of Array.from(files)) {
        const formDataUpload = new FormData()
        formDataUpload.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        })

        if (response.ok) {
          const data = await response.json()
          if (isMain && !formData.image) {
            setFormData(prev => ({ ...prev, image: data.url }))
          } else if (isMain) {
            setFormData(prev => ({ ...prev, image: data.url }))
          } else {
            setFormData(prev => ({ 
              ...prev, 
              additionalImages: [...prev.additionalImages, data.url] 
            }))
          }
        } else {
          const error = await response.json()
          alert(error.error || "Upload fehlgeschlagen")
        }
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload fehlgeschlagen")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const removeImage = (index: number) => {
    if (index === 0 && formData.image) {
      // Remove main image, promote first additional if exists
      if (formData.additionalImages.length > 0) {
        setFormData(prev => ({
          ...prev,
          image: prev.additionalImages[0],
          additionalImages: prev.additionalImages.slice(1)
        }))
      } else {
        setFormData(prev => ({ ...prev, image: "" }))
      }
    } else {
      // Remove from additional images
      const additionalIndex = formData.image ? index - 1 : index
      setFormData(prev => ({
        ...prev,
        additionalImages: prev.additionalImages.filter((_, i) => i !== additionalIndex)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      color: formData.color,
      image: formData.image,
      sizes: formData.sizes.split(",").map((s: string) => s.trim()).filter(Boolean),
      images: formData.additionalImages,
    }

    try {
      const url = product ? `/api/products/${product.id}` : "/api/products"
      const method = product ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onSuccess?.()
      } else {
        console.error("Failed to save product")
      }
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Produktname</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="z.B. RealCore Premium Hoodie" 
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Kategorie</Label>
          <Input 
            id="category" 
            value={formData.category}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="z.B. Hoodies" 
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea 
          id="description" 
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Produktbeschreibung..." 
          rows={3} 
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="color">Farbe</Label>
          <Input 
            id="color" 
            value={formData.color}
            onChange={(e) => handleChange("color", e.target.value)}
            placeholder="z.B. Navy" 
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sizes">Größen (kommagetrennt)</Label>
          <Input 
            id="sizes" 
            value={formData.sizes}
            onChange={(e) => handleChange("sizes", e.target.value)}
            placeholder="XS, S, M, L, XL, XXL" 
          />
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-3">
        <Label>Produktbilder</Label>
        
        {/* Image preview grid */}
        <div className="flex gap-2 flex-wrap">
          {allImages.map((img, index) => (
            <div key={index} className="relative group">
              <div className="relative h-20 w-20 rounded-lg overflow-hidden border">
                <Image 
                  src={img || "/placeholder.svg"} 
                  alt={`Bild ${index + 1}`} 
                  fill 
                  className="object-cover" 
                />
              </div>
              {index === 0 && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px]">
                  Haupt
                </Badge>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          {/* Upload button */}
          <label className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e, allImages.length === 0)}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground mt-1">Hochladen</span>
              </>
            )}
          </label>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Das erste Bild wird als Hauptbild verwendet. Max. 2MB pro Bild (JPEG, PNG, WebP, GIF). Bilder werden sicher in der Datenbank gespeichert.
        </p>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Speichern...
            </>
          ) : (
            product ? "Speichern" : "Erstellen"
          )}
        </Button>
      </div>
    </form>
  )
}

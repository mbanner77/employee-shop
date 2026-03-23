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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Plus, Search, ChevronLeft, ChevronRight, ImageIcon, Loader2, Upload, X, Trash2, Truck } from "lucide-react"

interface SupplierOption {
  id: string
  companyName: string
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [suppliersMap, setSuppliersMap] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch("/api/admin/suppliers")
      .then((res) => res.ok ? res.json() : [])
      .then((data: SupplierOption[]) => {
        const map: Record<string, string> = {}
        data.forEach((s) => { map[s.id] = s.companyName })
        setSuppliersMap(map)
      })
      .catch(() => {})
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?admin=1")
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
          <DialogContent className="flex max-w-2xl max-h-[85vh] flex-col overflow-hidden p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Neues Produkt hinzufügen</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6 pt-0">
              <ProductForm 
                onSuccess={handleProductSaved} 
                onCancel={() => setNewDialogOpen(false)} 
              />
            </div>
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
            supplierName={product.supplierId ? suppliersMap[product.supplierId] : undefined}
          />
        ))}
      </div>
    </div>
  )
}

// Single Product Card with Image Carousel
function ProductCard({ product, onRefresh, supplierName }: { product: Product; onRefresh: () => void; supplierName?: string }) {
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
            {supplierName && (
              <Badge variant="secondary" className="mb-2 ml-1">
                <Truck className="h-3 w-3 mr-1" />
                {supplierName}
              </Badge>
            )}
            <CardTitle className="text-base">{product.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="flex max-w-2xl max-h-[85vh] flex-col overflow-hidden p-0">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle>Produkt bearbeiten</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-6 pt-0">
                  <ProductForm 
                    product={product} 
                    onSuccess={handleSaved}
                    onCancel={() => setEditDialogOpen(false)}
                  />
                </div>
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
  const [loadingFull, setLoadingFull] = useState(!!product)
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fullProduct, setFullProduct] = useState<any>(product)

  useEffect(() => {
    fetch("/api/admin/suppliers")
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setSuppliers(data.map((s: SupplierOption) => ({ id: s.id, companyName: s.companyName }))))
      .catch(() => {})
  }, [])

  // Fetch full product data (including image, images, sizeChart) when editing
  useEffect(() => {
    if (product?.id) {
      fetch(`/api/products/${product.id}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            setFullProduct(data)
            setFormData({
              name: data.name || "",
              nameEn: data.nameEn || "",
              category: data.category || "",
              description: data.description || "",
              descriptionEn: data.descriptionEn || "",
              color: data.color || "",
              colorsInput: data.colors?.join(", ") || data.color || "",
              price: data.price != null ? String(data.price) : "",
              image: data.image || "",
              sizes: data.sizes?.join(", ") || "XS, S, M, L, XL, XXL",
              additionalImages: data.images || [],
              yearlyLimit: String(data.yearlyLimit ?? 4),
              multipleOrdersAllowed: data.multipleOrdersAllowed ?? true,
              maxQuantityPerOrder: String(data.maxQuantityPerOrder ?? 2),
              minStock: String(data.minStock ?? 5),
              sizeChart: data.sizeChart || "",
              stock: (data.stock || {}) as Record<string, number>,
              supplierId: data.supplierId || "",
            })
          }
        })
        .catch(() => {})
        .finally(() => setLoadingFull(false))
    }
  }, [product?.id])

  const [formData, setFormData] = useState({
    name: product?.name || "",
    nameEn: product?.nameEn || "",
    category: product?.category || "",
    description: product?.description || "",
    descriptionEn: product?.descriptionEn || "",
    color: product?.color || "",
    colorsInput: product?.colors?.join(", ") || product?.color || "",
    price: product?.price != null ? String(product.price) : "",
    image: product?.image || "",
    sizes: product?.sizes?.join(", ") || "XS, S, M, L, XL, XXL",
    additionalImages: product?.images || [] as string[],
    yearlyLimit: String(product?.yearlyLimit ?? 4),
    multipleOrdersAllowed: product?.multipleOrdersAllowed ?? true,
    maxQuantityPerOrder: String(product?.maxQuantityPerOrder ?? 2),
    minStock: String(product?.minStock ?? 5),
    sizeChart: product?.sizeChart || "",
    stock: (product?.stock || {}) as Record<string, number>,
    supplierId: product?.supplierId || "",
  })

  const parsedSizes = formData.sizes
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean)

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

    const stockPayload: Record<string, number> = {}
    for (const size of parsedSizes) {
      const value = formData.stock[size]
      if (typeof value === "number" && Number.isFinite(value)) {
        stockPayload[size] = value
      }
    }

    const payload = {
      name: formData.name,
      nameDe: formData.name,
      nameEn: formData.nameEn || formData.name,
      category: formData.category,
      description: formData.description,
      descriptionDe: formData.description,
      descriptionEn: formData.descriptionEn || formData.description,
      color: formData.color,
      colors: formData.colorsInput
        .split(",")
        .map((color: string) => color.trim())
        .filter(Boolean),
      price: formData.price.trim() ? Number(formData.price) : null,
      image: formData.image,
      sizes: parsedSizes,
      images: formData.additionalImages,
      yearlyLimit: parseInt(formData.yearlyLimit, 10) || 4,
      multipleOrdersAllowed: formData.multipleOrdersAllowed,
      maxQuantityPerOrder: parseInt(formData.maxQuantityPerOrder, 10) || 1,
      minStock: parseInt(formData.minStock, 10) || 5,
      sizeChart: formData.sizeChart?.trim() || null,
      stock: Object.keys(stockPayload).length > 0 ? stockPayload : null,
      supplierId: formData.supplierId || null,
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

  const handleStockChange = (size: string, value: string) => {
    const next = value === "" ? NaN : parseInt(value, 10)
    setFormData(prev => ({
      ...prev,
      stock: {
        ...prev.stock,
        [size]: Number.isFinite(next) ? Math.max(0, next) : prev.stock[size],
      },
    }))
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
          <Label htmlFor="nameEn">Produktname (Englisch)</Label>
          <Input 
            id="nameEn" 
            value={formData.nameEn} 
            onChange={(e) => handleChange("nameEn", e.target.value)}
            placeholder="z.B. RealCore Premium Hoodie" 
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung (Deutsch)</Label>
          <Textarea 
            id="description" 
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Produktbeschreibung..." 
            rows={3} 
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descriptionEn">Beschreibung (Englisch)</Label>
          <Textarea 
            id="descriptionEn" 
            value={formData.descriptionEn}
            onChange={(e) => handleChange("descriptionEn", e.target.value)}
            placeholder="Product description..." 
            rows={3} 
          />
        </div>
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
          <Label htmlFor="colorsInput">Farbauswahl (kommagetrennt)</Label>
          <Input
            id="colorsInput"
            value={formData.colorsInput}
            onChange={(e) => handleChange("colorsInput", e.target.value)}
            placeholder="z.B. Navy, Schwarz, Weiß"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sizes">Größen (kommagetrennt)</Label>
          <Input 
            id="sizes" 
            value={formData.sizes}
            onChange={(e) => handleChange("sizes", e.target.value)}
            placeholder="XS, S, M, L, XL, XXL" 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Privatpreis (€)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min={0}
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="yearlyLimit">Artikellimit pro Jahr</Label>
          <Input
            id="yearlyLimit"
            type="number"
            min={1}
            value={formData.yearlyLimit}
            onChange={(e) => handleChange("yearlyLimit", e.target.value)}
            placeholder="4"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxQuantityPerOrder">Max. Menge pro Bestellung</Label>
          <Input
            id="maxQuantityPerOrder"
            type="number"
            min={1}
            value={formData.maxQuantityPerOrder}
            onChange={(e) => handleChange("maxQuantityPerOrder", e.target.value)}
            placeholder="2"
          />
        </div>
      </div>

      {/* Lieferant */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Lieferant</Label>
        <Select
          value={formData.supplierId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value === "_none" ? "" : value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Kein Lieferant zugewiesen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">Kein Lieferant</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.companyName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Der zugewiesene Lieferant sieht nur Bestellungen mit seinen Artikeln im Lieferantenportal.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="minStock">Mindestbestand</Label>
          <Input
            id="minStock"
            type="number"
            min={0}
            value={formData.minStock}
            onChange={(e) => handleChange("minStock", e.target.value)}
            placeholder="5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sizeChart">Größentabelle (URL)</Label>
          <Input
            id="sizeChart"
            value={formData.sizeChart}
            onChange={(e) => handleChange("sizeChart", e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor="multipleOrdersAllowed">Mehrfachbestellungen erlauben</Label>
          <p className="text-xs text-muted-foreground">Wenn deaktiviert, kann der Artikel nur einmal pro Bestellung in den Warenkorb gelegt werden.</p>
        </div>
        <Switch
          id="multipleOrdersAllowed"
          checked={formData.multipleOrdersAllowed}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, multipleOrdersAllowed: checked }))}
        />
      </div>

      <div className="space-y-2">
        <Label>Bestand pro Größe</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {parsedSizes.map((size) => (
            <div key={size} className="space-y-1">
              <Label htmlFor={`stock-${size}`} className="text-xs text-muted-foreground">
                {size}
              </Label>
              <Input
                id={`stock-${size}`}
                type="number"
                min={0}
                value={typeof formData.stock[size] === "number" ? String(formData.stock[size]) : ""}
                onChange={(e) => handleStockChange(size, e.target.value)}
                placeholder="-"
              />
            </div>
          ))}
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

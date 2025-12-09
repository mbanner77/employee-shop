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
import { Edit, Plus, Search, ChevronLeft, ChevronRight, ImageIcon, Loader2 } from "lucide-react"

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

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
        <Dialog>
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
            <ProductForm />
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
            onEdit={setSelectedProduct} 
          />
        ))}
      </div>
    </div>
  )
}

// Single Product Card with Image Carousel
function ProductCard({ product, onEdit }: { product: Product; onEdit: (product: Product) => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Produkt bearbeiten</DialogTitle>
              </DialogHeader>
              <ProductForm product={product} />
            </DialogContent>
          </Dialog>
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

function ProductForm({ product }: { product?: Product }) {
  const allImages = product?.images && product.images.length > 0 
    ? [product.image, ...product.images] 
    : product?.image ? [product.image] : []

  return (
    <form className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Produktname</Label>
          <Input id="name" defaultValue={product?.name} placeholder="z.B. RealCore Premium Hoodie" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Kategorie</Label>
          <Input id="category" defaultValue={product?.category} placeholder="z.B. Hoodies" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea id="description" defaultValue={product?.description} placeholder="Produktbeschreibung..." rows={3} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="color">Farbe</Label>
          <Input id="color" defaultValue={product?.color} placeholder="z.B. Navy" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Hauptbild-URL</Label>
          <Input id="image" defaultValue={product?.image} placeholder="/image.jpg" />
        </div>
      </div>
      
      {/* Multiple images preview */}
      {allImages.length > 0 && (
        <div className="space-y-2">
          <Label>Produktbilder ({allImages.length})</Label>
          <div className="flex gap-2 flex-wrap">
            {allImages.map((img, index) => (
              <div key={index} className="relative h-16 w-16 rounded-lg overflow-hidden border">
                <Image 
                  src={img || "/placeholder.svg"} 
                  alt={`Bild ${index + 1}`} 
                  fill 
                  className="object-cover" 
                />
                {index === 0 && (
                  <Badge className="absolute bottom-0 left-0 right-0 rounded-none text-[10px] justify-center">
                    Haupt
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="additionalImages">Weitere Bilder (URLs, kommagetrennt)</Label>
        <Textarea 
          id="additionalImages" 
          defaultValue={product?.images?.join(", ")} 
          placeholder="/bild2.jpg, /bild3.jpg, /bild4.jpg" 
          rows={2} 
        />
        <p className="text-xs text-muted-foreground">Mehrere Bild-URLs mit Komma trennen</p>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline">
          Abbrechen
        </Button>
        <Button type="submit">{product ? "Speichern" : "Erstellen"}</Button>
      </div>
    </form>
  )
}

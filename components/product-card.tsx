"use client"

import React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Plus, Check, ChevronLeft, ChevronRight, Heart, Ruler } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useShopStore, type Product, type Size } from "@/lib/store"
import { SizeChartDialog } from "@/components/size-chart-dialog"
import { ProductReviews } from "@/components/product-reviews"

interface ProductCardProps {
  product: Product & { 
    stock?: Record<string, number> | null
    sizeChart?: string | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)
  const [mounted, setMounted] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const { cart, addToCart } = useShopStore()

  // Check if product is in favorites
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const res = await fetch("/api/favorites")
        if (res.ok) {
          const favorites = await res.json()
          setIsFavorite(favorites.some((f: { productId: string }) => f.productId === product.id))
        }
      } catch {
        // Not logged in or error
      }
    }
    checkFavorite()
  }, [product.id])

  const toggleFavorite = async () => {
    setFavoriteLoading(true)
    try {
      if (isFavorite) {
        await fetch(`/api/favorites?productId=${product.id}`, { method: "DELETE" })
        setIsFavorite(false)
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        })
        setIsFavorite(true)
      }
    } catch {
      // Error handling
    } finally {
      setFavoriteLoading(false)
    }
  }

  // Get stock for selected size
  const getStock = (size: string): number | null => {
    if (!product.stock) return null
    return (product.stock as Record<string, number>)[size] ?? null
  }

  // Combine main image with additional images array
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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const isInCart = mounted ? cart.some((item) => item.product.id === product.id) : false
  const cartFull = mounted ? cart.length >= 4 : false

  const handleAddToCart = () => {
    if (!selectedSize) {
      setMessage("Bitte wähle eine Größe aus")
      return
    }
    if (isInCart) {
      setMessage("Bereits im Warenkorb")
      return
    }
    if (cartFull) {
      setMessage("Maximal 4 Artikel")
      return
    }

    const success = addToCart(product, selectedSize)
    if (success) {
      setMessage("Hinzugefügt!")
    }
  }

  return (
    <Card className="group overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={allImages[currentImageIndex] || "/placeholder.svg"}
          alt={`${product.name} - Bild ${currentImageIndex + 1}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite()
          }}
          disabled={favoriteLoading}
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground transition-all hover:bg-background hover:scale-110"
          aria-label={isFavorite ? "Von Favoriten entfernen" : "Zu Favoriten hinzufügen"}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
        </button>
        {isInCart && (
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Check className="h-4 w-4 text-accent-foreground" />
          </div>
        )}
        
        {/* Image navigation for multiple images */}
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
      <CardContent className="p-4">
        {message && (
          <div className="mb-2 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground">{message}</div>
        )}
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.category}
        </div>
        <h3 className="mb-1 font-serif text-lg font-semibold leading-tight text-foreground">{product.name}</h3>
        {/* Product Reviews */}
        <div className="mb-2">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>
        <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        {/* Size Chart Button */}
        <button
          onClick={() => setShowSizeChart(true)}
          className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Ruler className="h-3 w-3" />
          Größentabelle
        </button>
        {/* Stock indicator */}
        {selectedSize && getStock(selectedSize) !== null && (
          <div className={`mb-2 text-xs ${getStock(selectedSize)! > 5 ? "text-green-600" : getStock(selectedSize)! > 0 ? "text-orange-500" : "text-red-500"}`}>
            {getStock(selectedSize)! > 5 ? "Auf Lager" : getStock(selectedSize)! > 0 ? `Nur noch ${getStock(selectedSize)} verfügbar` : "Nicht verfügbar"}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Select
            value={selectedSize || undefined}
            onValueChange={(value) => setSelectedSize(value as Size)}
            disabled={isInCart}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Größe wählen" />
            </SelectTrigger>
            <SelectContent>
              {product.sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="icon"
            onClick={handleAddToCart}
            disabled={isInCart || cartFull}
            className={isInCart ? "bg-accent hover:bg-accent" : ""}
          >
            {isInCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
      
      {/* Size Chart Dialog */}
      <SizeChartDialog
        open={showSizeChart}
        onOpenChange={setShowSizeChart}
        productName={product.name}
        category={product.category}
        sizeChartUrl={product.sizeChart || undefined}
      />
    </Card>
  )
}

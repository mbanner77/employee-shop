"use client"

import React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Plus, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useShopStore, type Product, type Size } from "@/lib/store"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)
  const [mounted, setMounted] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { cart, addToCart } = useShopStore()

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
        <h3 className="mb-2 font-serif text-lg font-semibold leading-tight text-foreground">{product.name}</h3>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
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
    </Card>
  )
}

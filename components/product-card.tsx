"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Plus, Check, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useShopStore, type Product, type Size } from "@/lib/store"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)
  const [mounted, setMounted] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const { cart, addToCart } = useShopStore()

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
      setMessage("Bitte wähle eine Größe")
      return
    }
    if (isInCart) {
      setMessage("Bereits im Warenkorb")
      return
    }
    if (cartFull) {
      setMessage("Maximum erreicht")
      return
    }

    const success = addToCart(product, selectedSize)
    if (success) {
      setMessage("Hinzugefügt!")
    }
  }

  const imageUrl = `/placeholder.svg?height=500&width=400&query=${encodeURIComponent(product.name + " " + product.color + " fashion product photo")}`

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-0 bg-card transition-all duration-500",
        isInCart ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : "shadow-sm hover:shadow-xl",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={product.name}
          fill
          className={cn("object-cover transition-all duration-700", isHovered ? "scale-110" : "scale-100")}
        />

        {/* Overlay gradient */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0",
          )}
        />

        {/* In cart badge */}
        {isInCart && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 shadow-lg">
            <ShoppingBag className="h-3.5 w-3.5 text-accent-foreground" />
            <span className="text-xs font-semibold text-accent-foreground">Im Warenkorb</span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 backdrop-blur-sm">
          <span className="text-xs font-medium text-foreground">{product.category}</span>
        </div>

        {/* Color indicator */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-sm">
          <div
            className="h-3 w-3 rounded-full border border-black/10"
            style={{
              backgroundColor:
                product.color.toLowerCase() === "navy"
                  ? "#1e3a5f"
                  : product.color.toLowerCase() === "weiß"
                    ? "#ffffff"
                    : product.color.toLowerCase() === "schwarz"
                      ? "#1a1a1a"
                      : product.color.toLowerCase() === "grau"
                        ? "#6b7280"
                        : product.color.toLowerCase() === "dunkelgrau"
                          ? "#374151"
                          : product.color.toLowerCase() === "hellgrau"
                            ? "#d1d5db"
                            : product.color.toLowerCase() === "olive"
                              ? "#556b2f"
                              : product.color.toLowerCase(),
            }}
          />
          <span className="text-xs font-medium text-foreground">{product.color}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Message */}
        {message && (
          <div
            className={cn(
              "mb-3 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium",
              message === "Hinzugefügt!" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground",
            )}
          >
            {message === "Hinzugefügt!" && <Check className="h-4 w-4" />}
            {message}
          </div>
        )}

        {/* Product info */}
        <h3 className="mb-1 text-lg font-semibold leading-tight text-foreground">{product.name}</h3>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{product.description}</p>

        {/* Size selector and button */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedSize || undefined}
            onValueChange={(value) => setSelectedSize(value as Size)}
            disabled={isInCart}
          >
            <SelectTrigger className="flex-1 bg-muted/50">
              <SelectValue placeholder="Größe" />
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
            onClick={handleAddToCart}
            disabled={isInCart || cartFull}
            className={cn("min-w-[120px] gap-2", isInCart && "bg-accent hover:bg-accent")}
          >
            {isInCart ? (
              <>
                <Check className="h-4 w-4" />
                Gewählt
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Hinzufügen
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}

"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Plus, Check } from "lucide-react"
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

  const imageUrl = `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.name + " " + product.color + " corporate clothing")}`

  return (
    <Card className="group overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isInCart && (
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Check className="h-4 w-4 text-accent-foreground" />
          </div>
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

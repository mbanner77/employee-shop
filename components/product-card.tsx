"use client"

import React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Plus, Check, ChevronLeft, ChevronRight, Heart, Ruler } from "lucide-react"
import { useAppTexts } from "@/components/app-text-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useShopStore, type Product, type Size } from "@/lib/store"
import { SizeChartDialog } from "@/components/size-chart-dialog"
import { ProductReviews } from "@/components/product-reviews"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || product.color || "")
  const [selectedCostBearer, setSelectedCostBearer] = useState<"COMPANY" | "EMPLOYEE">("COMPANY")
  const [mounted, setMounted] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const { text, textf } = useAppTexts()
  const { cart, addToCart, favoriteProductIds, addFavoriteLocal, removeFavoriteLocal } = useShopStore()

  const isFavorite = favoriteProductIds.includes(product.id)

  const toggleFavorite = async () => {
    setFavoriteLoading(true)
    try {
      if (isFavorite) {
        await fetch(`/api/favorites?productId=${product.id}`, { method: "DELETE" })
        removeFavoriteLocal(product.id)
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        })
        addFavoriteLocal(product.id)
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
  const availableColors = product.colors && product.colors.length > 0
    ? product.colors
    : product.color
      ? [product.color]
      : []

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
    setSelectedColor(product.colors?.[0] || product.color || "")
  }, [product.color, product.colors])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const maxQuantityForProduct = product.multipleOrdersAllowed === false
    ? 1
    : Math.max(1, product.maxQuantityPerOrder ?? 2)
  const productQuantityInCart = mounted
    ? cart
        .filter((item) => item.product.id === product.id)
        .reduce((sum, item) => sum + item.quantity, 0)
    : 0
  const selectedVariantQuantity = mounted && selectedSize
    ? cart
        .filter(
          (item) =>
            item.product.id === product.id &&
            item.size === selectedSize &&
            (item.color || "") === (selectedColor || "") &&
            item.costBearer === selectedCostBearer,
        )
        .reduce((sum, item) => sum + item.quantity, 0)
    : 0
  const isInCart = selectedVariantQuantity > 0
  const cartFull = mounted ? productQuantityInCart >= maxQuantityForProduct : false
  const parsedPrice = typeof product.price === "number"
    ? product.price
    : typeof product.price === "string"
      ? Number(product.price)
      : null

  const handleAddToCart = () => {
    if (!selectedSize) {
      setMessage(text("productCard.selectSize"))
      return
    }
    if (availableColors.length > 0 && !selectedColor) {
      setMessage(text("productCard.selectColor"))
      return
    }
    if (cartFull) {
      setMessage(textf("productCard.maxQuantity", { count: maxQuantityForProduct }))
      return
    }
    const success = addToCart(product, selectedSize, {
      color: selectedColor || undefined,
      costBearer: selectedCostBearer,
    })
    if (success) {
      setMessage(selectedVariantQuantity > 0 ? text("productCard.quantityIncreased") : text("productCard.added"))
    } else {
      setMessage(textf("productCard.maxQuantity", { count: maxQuantityForProduct }))
    }
  }

  return (
    <Card id={product.id} className="group overflow-hidden border-0 bg-card shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={allImages[currentImageIndex] || "/placeholder.svg"}
          alt={`${product.name} - ${textf("productCard.imageLabel", { index: currentImageIndex + 1 })}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite()
          }}
          disabled={favoriteLoading}
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground transition-all hover:bg-background hover:scale-110"
          aria-label={isFavorite ? text("productCard.favoriteRemove") : text("productCard.favoriteAdd")}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
        </button>
        {isInCart && (
          <div className="absolute right-3 top-3 flex min-w-8 items-center justify-center rounded-full bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">
            {selectedVariantQuantity}
          </div>
        )}

        {allImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background"
              aria-label={text("productCard.prevImage")}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background"
              aria-label={text("productCard.nextImage")}
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
                  aria-label={textf("productCard.imageLabel", { index: index + 1 })}
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
        <div className="mb-2">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>
        <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <button
          onClick={() => setShowSizeChart(true)}
          className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Ruler className="h-3 w-3" />
          {text("productCard.sizeChart")}
        </button>
        {selectedSize && getStock(selectedSize) !== null && (
          <div className={`mb-2 text-xs ${getStock(selectedSize)! > 5 ? "text-green-600" : getStock(selectedSize)! > 0 ? "text-orange-500" : "text-red-500"}`}>
            {getStock(selectedSize)! > 5
              ? text("productCard.inStock")
              : getStock(selectedSize)! > 0
                ? textf("productCard.lowStock", { count: getStock(selectedSize)! })
                : text("productCard.outOfStock")}
          </div>
        )}
        {parsedPrice !== null && Number.isFinite(parsedPrice) && (
          <p className="mb-2 text-sm font-medium text-foreground">{textf("productCard.privatePrice", { price: parsedPrice.toFixed(2) })}</p>
        )}
        {availableColors.length > 1 ? (
          <div className="mb-3">
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger>
                <SelectValue placeholder={text("productCard.selectColor")} />
              </SelectTrigger>
              <SelectContent>
                {availableColors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : availableColors.length === 1 ? (
          <p className="mb-3 text-sm text-muted-foreground">{textf("productCard.color", { color: availableColors[0] })}</p>
        ) : null}
        <div className="mb-3">
          <Select value={selectedCostBearer} onValueChange={(value) => setSelectedCostBearer(value as "COMPANY" | "EMPLOYEE")}>
            <SelectTrigger>
              <SelectValue placeholder={text("productCard.orderTypePlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COMPANY">{text("productCard.orderTypeCompany")}</SelectItem>
              <SelectItem value="EMPLOYEE">{text("productCard.orderTypePrivate")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedSize || undefined}
            onValueChange={(value) => setSelectedSize(value as Size)}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={text("productCard.selectSize")} />
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
            disabled={cartFull}
            className={isInCart ? "bg-accent hover:bg-accent" : ""}
            aria-label={text("productCard.addToCart")}
          >
            {isInCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {textf("productCard.inCartSummary", { count: productQuantityInCart, max: maxQuantityForProduct })}
        </p>
      </CardContent>
      
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

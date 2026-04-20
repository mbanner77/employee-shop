"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAppTexts } from "@/components/app-text-provider"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useShopStore, type Size } from "@/lib/store"
import { ProductReviews } from "@/components/product-reviews"
import { SizeChartDialog } from "@/components/size-chart-dialog"
import { toast } from "sonner"
import {
  Loader2,
  ArrowLeft,
  Heart,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Ruler,
  ShoppingCart,
  Package,
} from "lucide-react"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { text, textf } = useAppTexts()
  const { cart, addToCart, favoriteProductIds, addFavoriteLocal, removeFavoriteLocal } = useShopStore()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedCostBearer, setSelectedCostBearer] = useState<"COMPANY" | "EMPLOYEE">("COMPANY")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const isFavorite = favoriteProductIds.includes(productId)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`)
      if (!res.ok) {
        router.push("/")
        return
      }
      const data = await res.json()
      setProduct(data)
      setSelectedColor(data.colors?.[0] || data.color || "")
    } catch {
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    setFavoriteLoading(true)
    try {
      if (isFavorite) {
        await fetch(`/api/favorites?productId=${productId}`, { method: "DELETE" })
        removeFavoriteLocal(productId)
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        })
        addFavoriteLocal(productId)
      }
    } catch {
      // ignore
    } finally {
      setFavoriteLoading(false)
    }
  }

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  const allImages = product.images && product.images.length > 0
    ? [product.image, ...product.images]
    : [product.image]
  const availableColors = product.colors && product.colors.length > 0
    ? product.colors
    : product.color ? [product.color] : []

  const getStock = (size: string): number | null => {
    if (!product.stock) return null
    return (product.stock as Record<string, number>)[size] ?? null
  }

  const maxQuantityForProduct = product.multipleOrdersAllowed === false
    ? 1
    : Math.max(1, product.maxQuantityPerOrder ?? 2)
  const productQuantityInCart = cart
    .filter((item) => item.product.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0)
  const cartFull = productQuantityInCart >= maxQuantityForProduct

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
    if (cartFull) {
      setMessage(textf("productCard.maxQuantity", { count: maxQuantityForProduct }))
      return
    }
    const success = addToCart(product, selectedSize, {
      color: selectedColor || undefined,
      costBearer: selectedCostBearer,
    })
    if (success) {
      toast.success(`${product.name} wurde zum Warenkorb hinzugefügt`)
    } else {
      setMessage(textf("productCard.maxQuantity", { count: maxQuantityForProduct }))
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Link href="/#products">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Shop
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <Image
                src={allImages[currentImageIndex] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              <button
                onClick={toggleFavorite}
                disabled={favoriteLoading}
                className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground transition-all hover:bg-background hover:scale-110"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </button>

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 hover:bg-background"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 hover:bg-background"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      index === currentImageIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img || "/placeholder.svg"} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
              {parsedPrice !== null && Number.isFinite(parsedPrice) && (
                <p className="mt-2 text-xl font-semibold text-foreground">
                  {textf("productCard.privatePrice", { price: parsedPrice.toFixed(2) })}
                </p>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{product.description}</p>
            </div>

            <div>
              <ProductReviews productId={product.id} productName={product.name} />
            </div>

            {/* Size Chart — only if link is stored */}
            {product.sizeChart && (
              <button
                onClick={() => setShowSizeChart(true)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Ruler className="h-4 w-4" />
                Größentabelle anzeigen
              </button>
            )}

            {/* Color selector */}
            {availableColors.length > 1 ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Farbe</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Farbe wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColors.map((color: string) => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : availableColors.length === 1 ? (
              <p className="text-sm text-muted-foreground">Farbe: <span className="font-medium text-foreground">{availableColors[0]}</span></p>
            ) : null}

            {/* Cost bearer selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Bestellart</label>
              <Select value={selectedCostBearer} onValueChange={(v) => setSelectedCostBearer(v as "COMPANY" | "EMPLOYEE")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPANY">{text("productCard.orderTypeCompany")}</SelectItem>
                  <SelectItem value="EMPLOYEE">{text("productCard.orderTypePrivate")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Size selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Größe</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size: string) => {
                  const stock = getStock(size)
                  const outOfStock = stock !== null && stock <= 0
                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      disabled={outOfStock}
                      className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : outOfStock
                            ? "border-muted bg-muted text-muted-foreground line-through cursor-not-allowed"
                            : "border-border hover:border-primary"
                      }`}
                    >
                      {size}
                      {stock !== null && stock > 0 && stock <= 5 && (
                        <span className="ml-1 text-xs text-orange-500">({stock})</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Stock info */}
            {selectedSize && getStock(selectedSize) !== null && (
              <div className={`flex items-center gap-2 text-sm ${
                getStock(selectedSize)! > 5 ? "text-green-600" : getStock(selectedSize)! > 0 ? "text-orange-500" : "text-red-500"
              }`}>
                <Package className="h-4 w-4" />
                {getStock(selectedSize)! > 5
                  ? text("productCard.inStock")
                  : getStock(selectedSize)! > 0
                    ? textf("productCard.lowStock", { count: getStock(selectedSize)! })
                    : text("productCard.outOfStock")}
              </div>
            )}

            {/* Message */}
            {message && (
              <div className="rounded-lg bg-muted px-4 py-2 text-sm font-medium">{message}</div>
            )}

            {/* Add to Cart */}
            <Card>
              <CardContent className="p-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={cartFull}
                >
                  {cartFull ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Maximum erreicht ({productQuantityInCart}/{maxQuantityForProduct})
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      In den Warenkorb
                    </>
                  )}
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {textf("productCard.inCartSummary", { count: productQuantityInCart, max: maxQuantityForProduct })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SizeChartDialog
        open={showSizeChart}
        onOpenChange={setShowSizeChart}
        productName={product.name}
        category={product.category}
        sizeChartUrl={product.sizeChart || undefined}
      />
    </div>
  )
}

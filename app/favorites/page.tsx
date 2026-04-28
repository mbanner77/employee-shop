"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Heart, Trash2, ShoppingBag, Loader2 } from "lucide-react"
import { useAppTexts } from "@/components/app-text-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useShopStore } from "@/lib/store"
import { Header } from "@/components/header"

interface FavoriteProduct {
  id: string
  productId: string
  product: {
    id: string
    name: string
    category: string
    description: string
    image: string
    sizes: string[]
    color: string
  }
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const router = useRouter()
  const { text } = useAppTexts()
  const { addToCart } = useShopStore()

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites")
      if (res.status === 401) {
        router.push("/")
        return
      }
      if (res.ok) {
        const data = await res.json()
        setFavorites(data)
      }
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (productId: string) => {
    setRemoving(productId)
    try {
      const res = await fetch(`/api/favorites?productId=${productId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setFavorites(favorites.filter((f) => f.productId !== productId))
      }
    } catch (error) {
      console.error("Error removing favorite:", error)
    } finally {
      setRemoving(null)
    }
  }

  const handleAddToCart = (product: FavoriteProduct["product"]) => {
    const defaultSize = product.sizes[0]
    const success = addToCart(product as any, defaultSize as any)
    if (!success) {
      alert(text("favorites.maxReached"))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-32 pb-12">
        <div className="mb-8 flex items-center justify-center gap-3">
          <Heart className="h-8 w-8 text-red-500" />
          <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">{text("favorites.title")}</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="mb-2 text-xl font-semibold">{text("favorites.emptyTitle")}</h2>
            <p className="mb-6 text-muted-foreground">
              {text("favorites.emptyDescription")}
            </p>
            <Button onClick={() => router.push("/")}>{text("favorites.backToCollection")}</Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="group overflow-hidden">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={favorite.product.image || "/placeholder.svg"}
                    alt={favorite.product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => removeFavorite(favorite.productId)}
                    disabled={removing === favorite.productId}
                  >
                    {removing === favorite.productId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <CardContent className="p-4">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {favorite.product.category}
                  </div>
                  <h3 className="mb-2 font-semibold">{favorite.product.name}</h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {favorite.product.description}
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => handleAddToCart(favorite.product)}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {text("favorites.addToCart")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

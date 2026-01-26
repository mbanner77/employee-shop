"use client"

import { useState, useEffect } from "react"
import { Star, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ProductWithRating {
  id: string
  name: string
  image: string
  category: string
  averageRating: number
  totalReviews: number
}

export function TopRatedProducts() {
  const [products, setProducts] = useState<ProductWithRating[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopRated()
  }, [])

  const fetchTopRated = async () => {
    try {
      const res = await fetch("/api/reviews/top-rated")
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching top rated:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
            Top bewertete Produkte
          </h2>
          <p className="text-muted-foreground">
            Von unseren Mitarbeitern empfohlen
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/#${product.id}`}
              className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border"
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  {product.category}
                </p>
                <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(product.averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({product.totalReviews})
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

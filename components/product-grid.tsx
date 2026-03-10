"use client"

import { useState, useEffect, useMemo } from "react"
import { useAppTexts } from "@/components/app-text-provider"
import { ProductCard } from "./product-card"
import { useShopStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Loader2, Search, X } from "lucide-react"

const categories = [
  { value: "Alle", labelKey: "productGrid.category.all" },
  { value: "Hoodies", labelKey: "productGrid.category.hoodies" },
  { value: "T-Shirts", labelKey: "productGrid.category.tshirts" },
  { value: "Polos", labelKey: "productGrid.category.polos" },
  { value: "Jacken", labelKey: "productGrid.category.jackets" },
  { value: "Pullover", labelKey: "productGrid.category.sweaters" },
  { value: "Hosen", labelKey: "productGrid.category.pants" },
  { value: "Accessoires", labelKey: "productGrid.category.accessories" },
] as const

export function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState("Alle")
  const [searchQuery, setSearchQuery] = useState("")
  const { text, textf } = useAppTexts()
  const { products, productsLoading, fetchProducts, fetchFavoriteIds } = useShopStore()

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    fetchFavoriteIds()
  }, [fetchFavoriteIds])

  // Filter by category and search query
  const filteredProducts = useMemo(() => {
    let result = products
    
    // Filter by category
    if (activeCategory !== "Alle") {
      result = result.filter((p) => p.category === activeCategory)
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((p) => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.color.toLowerCase().includes(query)
      )
    }
    
    return result
  }, [products, activeCategory, searchQuery])

  if (productsLoading) {
    return (
      <section id="products" className="px-4 py-20 md:py-28">
        <div className="container mx-auto flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    )
  }

  return (
    <section id="products" className="px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-accent">
            {text("productGrid.eyebrow")}
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl text-balance">
            {text("productGrid.title")}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {textf("productGrid.description", { count: products.length })}
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={text("productGrid.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategory(category.value)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all",
                activeCategory === category.value
                  ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {text(category.labelKey)}
            </Button>
          ))}
        </div>

        {/* Products count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? textf("productGrid.resultsWithQuery", { count: filteredProducts.length, query: searchQuery })
              : textf("productGrid.results", { count: filteredProducts.length })}
          </p>
          {(searchQuery || activeCategory !== "Alle") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setActiveCategory("Alle")
              }}
            >
              {text("productGrid.reset")}
            </Button>
          )}
        </div>

        {/* Product grid or empty state */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{text("productGrid.emptyTitle")}</h3>
            <p className="text-muted-foreground mb-4">{text("productGrid.emptyDescription")}</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setActiveCategory("Alle")
              }}
            >
              {text("productGrid.showAll")}
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

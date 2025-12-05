"use client"

import { useState } from "react"
import { ProductCard } from "./product-card"
import { products } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const categories = ["Alle", "Hoodies", "T-Shirts", "Polos", "Jacken", "Pullover", "Hosen", "Accessoires"]

export function ProductGrid() {
  const [activeCategory, setActiveCategory] = useState("Alle")

  const filteredProducts = activeCategory === "Alle" ? products : products.filter((p) => p.category === activeCategory)

  return (
    <section id="products" className="px-4 py-20 md:py-28">
      <div className="container mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-accent">
            Exklusive Auswahl
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl text-balance">
            Unsere Kollektion
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Hochwertige Kleidung mit RealCore Branding. Wähle deine Favoriten aus {products.length} verfügbaren
            Artikeln.
          </p>
        </div>

        {/* Category filter */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all",
                activeCategory === category
                  ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "Artikel" : "Artikel"} gefunden
          </p>
        </div>

        {/* Product grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

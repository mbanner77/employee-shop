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
    <section className="px-4 py-16">
      <div className="container mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "rounded-full px-4 transition-all",
                activeCategory === category
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-muted",
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

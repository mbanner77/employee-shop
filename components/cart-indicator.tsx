"use client"

import { useShopStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export function CartIndicator() {
  const [mounted, setMounted] = useState(false)
  const cart = useShopStore((state) => state.cart)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cartLength = mounted ? cart.length : 0

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4].map((slot) => (
        <div
          key={slot}
          className={cn(
            "h-3 w-3 rounded-full border-2 transition-all duration-300",
            slot <= cartLength ? "border-accent bg-accent" : "border-muted-foreground/30 bg-transparent",
          )}
        />
      ))}
      <span className="ml-2 text-sm font-medium text-muted-foreground">{cartLength}/4 ausgewählt</span>
    </div>
  )
}

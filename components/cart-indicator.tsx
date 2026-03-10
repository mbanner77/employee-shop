"use client"

import { useAppTexts } from "@/components/app-text-provider"
import { useShopStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Check } from "lucide-react"

export function CartIndicator() {
  const [mounted, setMounted] = useState(false)
  const { text, textf } = useAppTexts()
  const cart = useShopStore((state) => state.cart)

  useEffect(() => {
    setMounted(true)
  }, [])

  const cartLength = mounted ? cart.length : 0

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        {[1, 2, 3, 4].map((slot) => (
          <div
            key={slot}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500",
              slot <= cartLength
                ? "border-accent bg-accent shadow-lg shadow-accent/30"
                : "border-white/20 bg-white/5 backdrop-blur-sm",
            )}
          >
            {slot <= cartLength ? (
              <Check className="h-5 w-5 text-white" />
            ) : (
              <span className="text-sm font-medium text-white/40">{slot}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-white/80">{textf("cartIndicator.selected", { count: cartLength })}</span>
        {cartLength === 4 && (
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">{text("cartIndicator.complete")}</span>
        )}
      </div>
    </div>
  )
}

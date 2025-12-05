"use client"

import Image from "next/image"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useShopStore } from "@/lib/store"

export function CartSummary() {
  const { cart, removeFromCart } = useShopStore()

  if (cart.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <p className="text-muted-foreground">Dein Warenkorb ist leer</p>
        <p className="mt-1 text-sm text-muted-foreground">Wähle bis zu 4 Artikel aus der Kollektion</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {cart.map((item) => (
        <div key={item.product.id} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image
              src={item.product.image || "/placeholder.svg"}
              alt={item.product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">{item.product.name}</h4>
            <p className="text-sm text-muted-foreground">
              Größe: <span className="font-medium">{item.size}</span>
            </p>
            <p className="text-sm text-muted-foreground">Farbe: {item.product.color}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFromCart(item.product.id)}
            className="flex-shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

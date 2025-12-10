"use client"

import Image from "next/image"
import { Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useShopStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"

export function CartSummary() {
  const { cart, removeFromCart } = useShopStore()
  const maxItems = 4
  const remaining = maxItems - cart.length

  if (cart.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium text-foreground">Dein Warenkorb ist leer</p>
        <p className="mt-1 text-sm text-muted-foreground">Wähle bis zu {maxItems} Artikel aus der Kollektion</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Cart limit indicator */}
      <div className="flex items-center justify-between rounded-lg bg-muted p-3">
        <span className="text-sm font-medium">
          {cart.length} von {maxItems} Artikeln
        </span>
        <Badge variant={remaining > 0 ? "secondary" : "destructive"}>
          {remaining > 0 ? `Noch ${remaining} verfügbar` : "Limit erreicht"}
        </Badge>
      </div>

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

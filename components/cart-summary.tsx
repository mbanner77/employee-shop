"use client"

import Link from "next/link"
import Image from "next/image"
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useShopStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"

export function CartSummary() {
  const { cart, removeFromCart, updateCartItemQuantity } = useShopStore()
  const maxItems = 4
  const companyCount = cart
    .filter((item) => item.costBearer === "COMPANY")
    .reduce((sum, item) => sum + item.quantity, 0)
  const privateCount = cart
    .filter((item) => item.costBearer === "EMPLOYEE")
    .reduce((sum, item) => sum + item.quantity, 0)
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const remaining = Math.max(0, maxItems - companyCount)

  if (cart.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
        <p className="font-medium text-foreground">Dein Warenkorb ist leer</p>
        <p className="mt-1 text-sm text-muted-foreground">Wähle bis zu {maxItems} Firmenartikel oder beliebig viele Privatartikel aus der Kollektion</p>
        <Link href="/" className="mt-4 inline-flex">
          <Button variant="outline">Weiter einkaufen</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <Link href="/">
          <Button variant="outline" size="sm">Weiter einkaufen</Button>
        </Link>
      </div>

      {/* Cart limit indicator */}
      <div className="flex items-center justify-between rounded-lg bg-muted p-3">
        <div>
          <span className="text-sm font-medium">
            {totalCount} Artikel im Warenkorb
          </span>
          <p className="text-xs text-muted-foreground">
            Firma: {companyCount} von {maxItems} | Privat: {privateCount}
          </p>
        </div>
        <Badge variant={remaining > 0 ? "secondary" : "destructive"}>
          {remaining > 0 ? `Noch ${remaining} Firmenartikel frei` : "Firmenlimit erreicht"}
        </Badge>
      </div>

      {cart.map((item) => (
        <div key={item.id} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm">
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
            {item.color && <p className="text-sm text-muted-foreground">Farbe: {item.color}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant={item.costBearer === "COMPANY" ? "secondary" : "outline"}>
                {item.costBearer === "COMPANY" ? "FIRMA" : "PRIVAT"}
              </Badge>
              <div className="flex items-center gap-1 rounded-md border px-1 py-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="min-w-6 text-center text-sm font-medium">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeFromCart(item.id)}
            className="flex-shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}

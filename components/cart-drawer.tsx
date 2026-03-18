"use client"

import Image from "next/image"
import Link from "next/link"
import { useAppTexts } from "@/components/app-text-provider"
import { useShopStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react"

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { text } = useAppTexts()
  const { cart, removeFromCart, updateCartItemQuantity, clearCart } = useShopStore()

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96 flex flex-col p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Warenkorb
            {totalItems > 0 && (
              <Badge variant="secondary" className="ml-auto">{totalItems} Artikel</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Dein Warenkorb ist leer</p>
            <Link href="/#products" onClick={() => onOpenChange(false)}>
              <Button variant="outline">Weiter einkaufen</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 p-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={item.product.image || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-xs">{item.size}</Badge>
                        {item.color && (
                          <span className="text-xs text-muted-foreground">{item.color}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${item.costBearer === "COMPANY" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                        >
                          {item.costBearer === "COMPANY" ? "Firma" : "Privat"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              if (item.quantity <= 1) {
                                removeFromCart(item.id)
                              } else {
                                updateCartItemQuantity(item.id, item.quantity - 1)
                              }
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Artikel gesamt</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <Link href="/checkout" onClick={() => onOpenChange(false)}>
                <Button className="w-full" size="lg">
                  Zur Bestellung
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => {
                  clearCart()
                  onOpenChange(false)
                }}
              >
                Warenkorb leeren
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

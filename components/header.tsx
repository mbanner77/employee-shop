"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, Menu, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useShopStore } from "@/lib/store"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cart = useShopStore((state) => state.cart)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="https://realcore.info/bilder/RealCore_Logo.png"
            alt="RealCore Logo"
            width={140}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Kollektion
          </Link>
          <Link
            href="/checkout"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Bestellung
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/checkout">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {mounted && cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                  {cart.length}
                </span>
              )}
              <span className="sr-only">Warenkorb</span>
            </Button>
          </Link>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menü öffnen</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 pt-8">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">
                  Kollektion
                </Link>
                <Link href="/checkout" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">
                  Bestellung
                </Link>
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">
                  Admin Dashboard
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

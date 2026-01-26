"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ShoppingBag, Menu, Settings, X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useShopStore } from "@/lib/store"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { cn } from "@/lib/utils"

export function Header() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const cart = useShopStore((state) => state.cart)
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith("/admin")

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // On admin pages, always use dark header style
  const useDarkHeader = isAdminPage || scrolled

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isAdminPage 
          ? "border-b border-slate-700 bg-slate-900 py-3" 
          : scrolled 
            ? "border-b border-border bg-background/95 py-3 backdrop-blur-lg" 
            : "bg-transparent py-5",
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="https://realcore.info/bilder/RealCore_Logo.png"
            alt="RealCore Logo"
            width={160}
            height={45}
            className={cn("h-10 w-auto transition-all duration-300", (!scrolled || isAdminPage) && "brightness-0 invert")}
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              useDarkHeader && !isAdminPage
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            Kollektion
          </Link>
          <Link
            href="/checkout"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              useDarkHeader && !isAdminPage
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            Bestellung
          </Link>
          <Link
            href="/favorites"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              useDarkHeader && !isAdminPage
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            Favoriten
          </Link>
          <Link
            href="/admin"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              useDarkHeader && !isAdminPage
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <Settings className="h-4 w-4" />
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className={cn(useDarkHeader && !isAdminPage ? "" : "text-white")}>
            <ThemeToggle />
          </div>
          <Link href="/checkout">
            <Button
              variant="ghost"
              size="icon"
              className={cn("relative rounded-full", useDarkHeader && !isAdminPage ? "hover:bg-muted" : "text-white hover:bg-white/10")}
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && cart.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground shadow-lg">
                  {cart.length}
                </span>
              )}
              <span className="sr-only">Warenkorb</span>
            </Button>
          </Link>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full", useDarkHeader && !isAdminPage ? "hover:bg-muted" : "text-white hover:bg-white/10")}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menü öffnen</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <span className="text-lg font-semibold">Menü</span>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col gap-1 p-4">
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-4 py-3 text-lg font-medium hover:bg-muted"
                  >
                    Kollektion
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-4 py-3 text-lg font-medium hover:bg-muted"
                  >
                    Bestellung
                  </Link>
                  <Link
                    href="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-4 py-3 text-lg font-medium hover:bg-muted"
                  >
                    Favoriten
                  </Link>
                  <Link
                    href="/feedback"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-4 py-3 text-lg font-medium hover:bg-muted"
                  >
                    Feedback
                  </Link>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-4 py-3 text-lg font-medium hover:bg-muted"
                  >
                    Admin Dashboard
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

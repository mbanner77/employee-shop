"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ShoppingBag, Menu, Settings, X, Heart, User } from "lucide-react"
import { useAppTexts } from "@/components/app-text-provider"
import { Button } from "@/components/ui/button"
import { useShopStore } from "@/lib/store"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { cn } from "@/lib/utils"
import { CartDrawer } from "@/components/cart-drawer"

export function Header() {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const { text } = useAppTexts()
  const cart = useShopStore((state) => state.cart)
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith("/admin")
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => setIsAdminAuthenticated(Boolean(data?.authenticated)))
      .catch(() => setIsAdminAuthenticated(false))
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
            src="/realcore-logo.png"
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
            {text("header.nav.collection")}
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
            {text("header.nav.order")}
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
            {text("header.nav.favorites")}
          </Link>
          <Link
            href="/my-orders"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              useDarkHeader && !isAdminPage
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            {text("header.nav.orders")}
          </Link>
          <Link
            href="/profile"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              useDarkHeader && !isAdminPage
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <User className="h-4 w-4" />
          </Link>
          <Link
            href="/feedback"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              useDarkHeader && !isAdminPage
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            {text("header.nav.feedback")}
          </Link>
          {isAdminAuthenticated && (
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
          )}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className={cn(useDarkHeader && !isAdminPage ? "" : "text-white")}>
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCartDrawerOpen(true)}
            className={cn("relative rounded-full", useDarkHeader && !isAdminPage ? "hover:bg-muted" : "text-white hover:bg-white/10")}
          >
            <ShoppingBag className="h-5 w-5" />
            {mounted && cartItemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground shadow-lg">
                {cartItemCount}
              </span>
            )}
            <span className="sr-only">{text("header.cart.srOnly")}</span>
          </Button>
          <CartDrawer open={cartDrawerOpen} onOpenChange={setCartDrawerOpen} />

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-full", useDarkHeader && !isAdminPage ? "hover:bg-muted" : "text-white hover:bg-white/10")}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">{text("header.menu.open")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-border p-4">
                  <span className="text-lg font-semibold">{text("header.mobile.menuTitle")}</span>
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
                    {text("header.nav.collection")}
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-4 py-3 text-lg font-medium hover:bg-muted"
                  >
                    {text("header.nav.order")}
                  </Link>
                  <Link
                    href="/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-4 py-3 text-lg font-medium hover:bg-muted"
                  >
                    {text("header.nav.favorites")}
                  </Link>
                  <Link
                    href="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-4 py-3 text-lg font-medium hover:bg-muted"
                  >
                    {text("header.nav.orders")}
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-4 py-3 text-lg font-medium hover:bg-muted"
                  >
                    {text("header.mobile.profile")}
                  </Link>
                  <Link
                    href="/feedback"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-4 py-3 text-lg font-medium hover:bg-muted"
                  >
                    {text("header.nav.feedback")}
                  </Link>
                  {isAdminAuthenticated && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-lg px-4 py-3 text-lg font-medium hover:bg-muted"
                    >
                      {text("header.mobile.admin")}
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

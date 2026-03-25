"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Logo & Company */}
          <div className="space-y-3">
            <Image
              src="/realcore-logo.png"
              alt="RealCore Logo"
              width={120}
              height={34}
              className="h-8 w-auto"
            />
            <p className="text-sm text-muted-foreground">
              RealCore GmbH – Mitarbeiter-Shop
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} RealCore GmbH. Alle Rechte vorbehalten.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Shop</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/#products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Kollektion
              </Link>
              <Link href="/checkout" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Bestellung
              </Link>
              <Link href="/my-orders" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Meine Bestellungen
              </Link>
              <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Profil
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Rechtliches</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/impressum" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Impressum
              </Link>
              <Link href="/datenschutz" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Datenschutz
              </Link>
              <Link href="/feedback" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Feedback
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

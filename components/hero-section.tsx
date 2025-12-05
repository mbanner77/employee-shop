"use client"

import { CartIndicator } from "./cart-indicator"
import { ArrowDown } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted via-background to-background" />

      <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
        Kollektion 2025
      </span>

      <h1 className="mb-6 max-w-4xl font-serif text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl text-balance">
        Deine Mitarbeiter&shy;kollektion
      </h1>

      <p className="mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
        Wähle <strong className="text-foreground">4 Teile</strong> aus unserer exklusiven Kollektion. Kostenlos für alle
        RealCore Mitarbeiter.
      </p>

      <CartIndicator />

      <div className="mt-12 animate-bounce">
        <ArrowDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  )
}

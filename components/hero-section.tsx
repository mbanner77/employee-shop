"use client"

import { useAppTexts } from "@/components/app-text-provider"
import { CartIndicator } from "./cart-indicator"
import { ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const { text } = useAppTexts()

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-primary">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex min-h-[85vh] flex-col items-center justify-center px-4 py-20 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-white/90">{text("hero.badge")}</span>
        </div>

        {/* Main heading */}
        <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl text-balance">
          {text("hero.title.prefix")}{" "}
          <span className="relative">
            <span className="relative z-10 bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">
              {text("hero.title.highlight")}
            </span>
          </span>
          <br />
          {text("hero.title.suffix")}
        </h1>

        {/* Subheading */}
        <p className="mb-10 max-w-xl whitespace-pre-line text-lg leading-relaxed text-white/60 sm:text-xl">
          {text("hero.subtitle")}
        </p>

        {/* Cart indicator */}
        <div className="mb-12">
          <CartIndicator />
        </div>

        {/* CTA Button */}
        <Button
          onClick={scrollToProducts}
          size="lg"
          className="group gap-2 rounded-full bg-white px-8 py-6 text-base font-semibold text-primary hover:bg-white/90"
        >
          {text("hero.cta")}
          <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
        </Button>
      </div>
    </section>
  )
}

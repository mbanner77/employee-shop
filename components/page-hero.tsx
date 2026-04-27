"use client"

import type { LucideIcon } from "lucide-react"
import { Sparkles } from "lucide-react"

interface PageHeroProps {
  title: string
  description?: string
  icon?: LucideIcon
  badge?: string
}

export function PageHero({ title, description, icon: Icon = Sparkles, badge }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-slate-900">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 pb-12 pt-32 text-center sm:pt-36">
        {badge && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-sm">
            <Icon className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-white/90">{badge}</span>
          </div>
        )}

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          {title}
        </h1>

        {description && (
          <p className="mx-auto max-w-2xl text-lg text-white/70 sm:text-xl">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}

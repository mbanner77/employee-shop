import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProductGrid } from "@/components/product-grid"
import { Package, Truck, Award } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />

        <section className="border-y border-border bg-muted/30 py-12">
          <div className="container mx-auto grid gap-8 px-4 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">4 Teile Gratis</h3>
              <p className="text-sm text-muted-foreground">Jedes Jahr 4 Artikel kostenfrei für dich</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Truck className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Direkte Lieferung</h3>
              <p className="text-sm text-muted-foreground">Versand an deine Wunschadresse</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Premium Qualität</h3>
              <p className="text-sm text-muted-foreground">Hochwertige Materialien & Verarbeitung</p>
            </div>
          </div>
        </section>

        <ProductGrid />
      </main>

      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">© 2025 RealCore GmbH. Alle Rechte vorbehalten.</p>
            <p className="text-xs text-muted-foreground/60">Bei Fragen wende dich an deine HR-Abteilung.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

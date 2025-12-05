import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProductGrid } from "@/components/product-grid"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ProductGrid />
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2025 RealCore GmbH. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  )
}

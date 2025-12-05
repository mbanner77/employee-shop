import { Header } from "@/components/header"
import { CartSummary } from "@/components/cart-summary"
import { CheckoutForm } from "@/components/checkout-form"
import { CartIndicator } from "@/components/cart-indicator"

export default function CheckoutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">Deine Bestellung</h1>
          <p className="text-muted-foreground">Überprüfe deine Auswahl und gib deine Lieferadresse ein</p>
          <div className="mt-4 flex justify-center">
            <CartIndicator />
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Ausgewählte Artikel</h2>
            <CartSummary />
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">Lieferadresse</h2>
            <div className="rounded-xl bg-card p-6 shadow-sm">
              <CheckoutForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

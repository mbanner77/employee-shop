"use client"

import { Header } from "@/components/header"
import { CartSummary } from "@/components/cart-summary"
import { CheckoutForm } from "@/components/checkout-form"
import { CartIndicator } from "@/components/cart-indicator"
import { useAppTexts } from "@/components/app-text-provider"

export default function CheckoutPage() {
  const { text } = useAppTexts()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">{text("checkoutPage.title")}</h1>
          <p className="text-muted-foreground">{text("checkoutPage.description")}</p>
          <div className="mt-4 flex justify-center">
            <CartIndicator />
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">{text("checkoutPage.selectedItems")}</h2>
            <CartSummary />
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-foreground">{text("checkoutPage.address")}</h2>
            <div className="rounded-xl bg-card p-6 shadow-sm">
              <CheckoutForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

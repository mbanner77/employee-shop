"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { useAppTexts } from "@/components/app-text-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Package, ClipboardList, Home, Mail, Truck } from "lucide-react"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const { text } = useAppTexts()
  const id = searchParams.get("id") || undefined

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto flex flex-col items-center justify-center px-4 py-24">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
              {text("orderConfirmation.title")}
            </h1>

            <p className="mb-4 text-muted-foreground">{text("orderConfirmation.description")}</p>

            {id && (
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                <Package className="h-4 w-4" />
                <span className="font-mono text-sm">#{id.slice(-8).toUpperCase()}</span>
              </div>
            )}

            <div className="mb-8 space-y-3 text-left bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{text("orderConfirmation.emailTitle")}</p>
                  <p className="text-sm text-muted-foreground">
                    {text("orderConfirmation.emailDescription")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{text("orderConfirmation.shippingTitle")}</p>
                  <p className="text-sm text-muted-foreground">
                    {text("orderConfirmation.shippingDescription")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/my-orders">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  {text("orderConfirmation.orders")}
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full sm:w-auto">
                  <Home className="h-4 w-4 mr-2" />
                  {text("orderConfirmation.backHome")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

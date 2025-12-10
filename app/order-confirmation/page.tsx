import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Package, ClipboardList, Home, Mail, Truck } from "lucide-react"

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

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
              Bestellung erfolgreich!
            </h1>

            <p className="mb-4 text-muted-foreground">Vielen Dank für deine Bestellung</p>

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
                  <p className="font-medium">Bestätigung per E-Mail</p>
                  <p className="text-sm text-muted-foreground">
                    Du erhältst in Kürze eine Bestätigung an deine E-Mail-Adresse.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Versand in 2-3 Werktagen</p>
                  <p className="text-sm text-muted-foreground">
                    Deine Artikel werden an deine angegebene Adresse versendet.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/my-orders">
                <Button variant="outline" className="w-full sm:w-auto">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Meine Bestellungen
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full sm:w-auto">
                  <Home className="h-4 w-4 mr-2" />
                  Zurück zum Shop
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

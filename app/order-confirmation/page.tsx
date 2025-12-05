import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle2 className="h-10 w-10 text-accent" />
        </div>

        <h1 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl">Bestellung erfolgreich!</h1>

        <p className="mb-2 text-lg text-muted-foreground">Vielen Dank für deine Bestellung</p>

        {id && (
          <p className="mb-8 font-mono text-sm text-muted-foreground">
            Bestellnummer: <span className="font-semibold text-foreground">{id}</span>
          </p>
        )}

        <div className="max-w-md text-muted-foreground">
          <p className="mb-6">
            Deine ausgewählten Artikel werden in Kürze an deine angegebene Adresse versendet. Du erhältst eine E-Mail
            mit der Sendungsverfolgung.
          </p>
        </div>

        <Link href="/">
          <Button size="lg">Zurück zur Kollektion</Button>
        </Link>
      </main>
    </div>
  )
}

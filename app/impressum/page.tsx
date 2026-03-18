"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12 flex-1">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </Link>

        <div className="prose prose-sm max-w-3xl mx-auto">
          <h1>Impressum</h1>

          <h2>Angaben gemäß § 5 TMG</h2>
          <p>
            RealCore GmbH<br />
            Musterstraße 1<br />
            12345 Musterstadt
          </p>

          <h2>Vertreten durch</h2>
          <p>Geschäftsführer: Max Mustermann</p>

          <h2>Kontakt</h2>
          <p>
            Telefon: +49 (0) 123 456789<br />
            E-Mail: info@realcore.de
          </p>

          <h2>Registereintrag</h2>
          <p>
            Eintragung im Handelsregister.<br />
            Registergericht: Amtsgericht Musterstadt<br />
            Registernummer: HRB 12345
          </p>

          <h2>Umsatzsteuer-ID</h2>
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
            DE123456789
          </p>

          <h2>Haftungsausschluss</h2>
          <p>
            Die Inhalte dieser internen Plattform wurden mit größtmöglicher Sorgfalt erstellt.
            Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

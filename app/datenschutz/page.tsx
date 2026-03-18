"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DatenschutzPage() {
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
          <h1>Datenschutzerklärung</h1>

          <h2>1. Verantwortlicher</h2>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Plattform ist:<br />
            RealCore GmbH<br />
            Musterstraße 1<br />
            12345 Musterstadt<br />
            E-Mail: datenschutz@realcore.de
          </p>

          <h2>2. Erhobene Daten</h2>
          <p>
            Im Rahmen des Mitarbeiter-Shops werden folgende personenbezogene Daten verarbeitet:
          </p>
          <ul>
            <li>Name, E-Mail-Adresse und Abteilung (zur Identifikation und Bestellabwicklung)</li>
            <li>Lieferadressen (zur Zustellung der Bestellungen)</li>
            <li>Bestellhistorie (zur Verwaltung und Nachverfolgung)</li>
            <li>Bewertungen und Feedback (zur Qualitätssicherung)</li>
          </ul>

          <h2>3. Zweck der Datenverarbeitung</h2>
          <p>
            Die Daten werden ausschließlich zur Abwicklung von Bestellungen im internen
            Mitarbeiter-Shop sowie zur Kommunikation über den Bestellstatus verwendet.
          </p>

          <h2>4. Rechtsgrundlage</h2>
          <p>
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO
            (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
            des Arbeitgebers an der Bereitstellung von Mitarbeiterleistungen).
          </p>

          <h2>5. Speicherdauer</h2>
          <p>
            Personenbezogene Daten werden so lange gespeichert, wie es für die Zwecke,
            für die sie verarbeitet werden, erforderlich ist, oder solange gesetzliche
            Aufbewahrungsfristen dies verlangen.
          </p>

          <h2>6. Ihre Rechte</h2>
          <p>Sie haben das Recht auf:</p>
          <ul>
            <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          </ul>

          <h2>7. Kontakt</h2>
          <p>
            Bei Fragen zum Datenschutz wenden Sie sich bitte an:<br />
            datenschutz@realcore.de
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ShopProvider } from "@/components/shop-provider"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _playfair = Playfair_Display({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RealCore Mitarbeitershop",
  description: "Deine jährliche Mitarbeiterkollektion - Wähle 4 Teile kostenlos",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body className="font-sans antialiased">
        <ShopProvider>{children}</ShopProvider>
        <Analytics />
      </body>
    </html>
  )
}

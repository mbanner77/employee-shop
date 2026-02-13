"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Ruler } from "lucide-react"

interface SizeChartModalProps {
  sizeChart?: string | null
  category?: string
  language?: "de" | "en"
}

// Standard-Größentabellen nach Kategorie
const defaultSizeCharts = {
  de: {
    "T-Shirts": {
      headers: ["Größe", "Brustumfang (cm)", "Länge (cm)"],
      rows: [
        ["XS", "86-91", "66"],
        ["S", "91-96", "69"],
        ["M", "96-101", "72"],
        ["L", "101-106", "74"],
        ["XL", "106-111", "76"],
        ["XXL", "111-116", "78"],
      ],
    },
    Hoodies: {
      headers: ["Größe", "Brustumfang (cm)", "Länge (cm)", "Ärmel (cm)"],
      rows: [
        ["XS", "88-93", "64", "60"],
        ["S", "93-98", "67", "62"],
        ["M", "98-103", "70", "64"],
        ["L", "103-108", "72", "66"],
        ["XL", "108-113", "74", "68"],
        ["XXL", "113-118", "76", "70"],
      ],
    },
    Jacken: {
      headers: ["Größe", "Brustumfang (cm)", "Länge (cm)", "Schulter (cm)"],
      rows: [
        ["XS", "90-95", "62", "42"],
        ["S", "95-100", "65", "44"],
        ["M", "100-105", "68", "46"],
        ["L", "105-110", "70", "48"],
        ["XL", "110-115", "72", "50"],
        ["XXL", "115-120", "74", "52"],
      ],
    },
    Polos: {
      headers: ["Größe", "Brustumfang (cm)", "Länge (cm)"],
      rows: [
        ["XS", "86-91", "68"],
        ["S", "91-96", "70"],
        ["M", "96-101", "72"],
        ["L", "101-106", "74"],
        ["XL", "106-111", "76"],
        ["XXL", "111-116", "78"],
      ],
    },
    Accessoires: {
      headers: ["Größe", "Kopfumfang (cm)"],
      rows: [
        ["S", "54-56"],
        ["M", "56-58"],
        ["L", "58-60"],
      ],
    },
    default: {
      headers: ["Größe", "Brustumfang (cm)", "Länge (cm)"],
      rows: [
        ["XS", "86-91", "66"],
        ["S", "91-96", "69"],
        ["M", "96-101", "72"],
        ["L", "101-106", "74"],
        ["XL", "106-111", "76"],
        ["XXL", "111-116", "78"],
      ],
    },
  },
  en: {
    "T-Shirts": {
      headers: ["Size", "Chest (cm)", "Length (cm)"],
      rows: [
        ["XS", "86-91", "66"],
        ["S", "91-96", "69"],
        ["M", "96-101", "72"],
        ["L", "101-106", "74"],
        ["XL", "106-111", "76"],
        ["XXL", "111-116", "78"],
      ],
    },
    Hoodies: {
      headers: ["Size", "Chest (cm)", "Length (cm)", "Sleeve (cm)"],
      rows: [
        ["XS", "88-93", "64", "60"],
        ["S", "93-98", "67", "62"],
        ["M", "98-103", "70", "64"],
        ["L", "103-108", "72", "66"],
        ["XL", "108-113", "74", "68"],
        ["XXL", "113-118", "76", "70"],
      ],
    },
    Jacken: {
      headers: ["Size", "Chest (cm)", "Length (cm)", "Shoulder (cm)"],
      rows: [
        ["XS", "90-95", "62", "42"],
        ["S", "95-100", "65", "44"],
        ["M", "100-105", "68", "46"],
        ["L", "105-110", "70", "48"],
        ["XL", "110-115", "72", "50"],
        ["XXL", "115-120", "74", "52"],
      ],
    },
    default: {
      headers: ["Size", "Chest (cm)", "Length (cm)"],
      rows: [
        ["XS", "86-91", "66"],
        ["S", "91-96", "69"],
        ["M", "96-101", "72"],
        ["L", "101-106", "74"],
        ["XL", "106-111", "76"],
        ["XXL", "111-116", "78"],
      ],
    },
  },
}

export function SizeChartModal({ sizeChart, category, language = "de" }: SizeChartModalProps) {
  const [open, setOpen] = useState(false)

  const texts = {
    de: {
      title: "Größentabelle",
      button: "Größentabelle",
      tip: "Tipp: Messen Sie Ihre Körpermaße und vergleichen Sie diese mit der Tabelle.",
      note: "Alle Angaben in Zentimeter (cm)",
    },
    en: {
      title: "Size Chart",
      button: "Size Chart",
      tip: "Tip: Measure your body and compare with the chart.",
      note: "All measurements in centimeters (cm)",
    },
  }

  const t = texts[language]
  const charts = defaultSizeCharts[language]
  
  // Verwende benutzerdefinierte Größentabelle falls vorhanden
  if (sizeChart && sizeChart.startsWith("http")) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Ruler className="h-4 w-4" />
            {t.button}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img 
              src={sizeChart} 
              alt={t.title}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Standard-Größentabelle basierend auf Kategorie
  const chartData = category && charts[category as keyof typeof charts] 
    ? charts[category as keyof typeof charts]
    : charts.default

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Ruler className="h-4 w-4" />
          {t.button}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            {t.title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  {chartData.headers.map((header, i) => (
                    <th 
                      key={i} 
                      className="px-4 py-3 text-left text-sm font-semibold border-b"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chartData.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    {row.map((cell, j) => (
                      <td 
                        key={j} 
                        className={`px-4 py-3 text-sm border-b ${j === 0 ? "font-medium" : ""}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              💡 {t.tip}
            </p>
          </div>
          
          <p className="mt-3 text-xs text-muted-foreground text-center">
            {t.note}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

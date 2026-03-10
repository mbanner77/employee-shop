"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAppTexts } from "@/components/app-text-provider"
import { Ruler } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface SizeChartDialogProps {
  category?: string
  sizeChart?: string | null
  productName?: string
  sizeChartUrl?: string
  // Controlled mode props
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Default size charts for different categories
const defaultSizeCharts: Record<string, { sizes: string[]; measurements: Record<string, string[]> }> = {
  "T-Shirt": {
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: {
      "Brustweite (cm)": ["86-91", "91-96", "96-101", "101-106", "106-111", "111-116"],
      "Länge (cm)": ["66", "69", "72", "74", "76", "78"],
      "Schulterbreite (cm)": ["42", "44", "46", "48", "50", "52"],
    },
  },
  "Polo-Shirt": {
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: {
      "Brustweite (cm)": ["88-93", "93-98", "98-103", "103-108", "108-113", "113-118"],
      "Länge (cm)": ["68", "71", "74", "76", "78", "80"],
      "Schulterbreite (cm)": ["43", "45", "47", "49", "51", "53"],
    },
  },
  "Jacke": {
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: {
      "Brustweite (cm)": ["92-97", "97-102", "102-107", "107-112", "112-117", "117-122"],
      "Länge (cm)": ["62", "65", "68", "71", "74", "77"],
      "Ärmellänge (cm)": ["60", "62", "64", "66", "68", "70"],
    },
  },
  "Hoodie": {
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: {
      "Brustweite (cm)": ["96-101", "101-106", "106-111", "111-116", "116-121", "121-126"],
      "Länge (cm)": ["64", "67", "70", "72", "74", "76"],
      "Ärmellänge (cm)": ["61", "63", "65", "67", "69", "71"],
    },
  },
  default: {
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    measurements: {
      "Brustweite (cm)": ["86-91", "91-96", "96-101", "101-106", "106-111", "111-116"],
      "Länge (cm)": ["66", "69", "72", "74", "76", "78"],
    },
  },
}

export function SizeChartDialog({ 
  category, 
  sizeChart, 
  productName,
  sizeChartUrl,
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange 
}: SizeChartDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const { text, textf } = useAppTexts()
  
  // Use controlled or uncontrolled mode
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  // Use custom size chart if provided (URL or content), otherwise use default
  const chartData = defaultSizeCharts[category || ""] || defaultSizeCharts.default

  // If sizeChart or sizeChartUrl is a URL, show an image
  const chartUrl = sizeChartUrl || sizeChart
  const isUrl = chartUrl?.startsWith("http")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
            <Ruler className="h-3 w-3 mr-1" />
            {text("sizeChart.button")}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{textf("sizeChart.title", { category: category ? `- ${category}` : "" })}</DialogTitle>
        </DialogHeader>
        
        {isUrl ? (
          <div className="flex justify-center">
            <img 
              src={sizeChart!} 
              alt={text("sizeChart.imageAlt")} 
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {text("sizeChart.intro")}
            </p>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">{text("sizeChart.measurement")}</TableHead>
                    {chartData.sizes.map((size) => (
                      <TableHead key={size} className="text-center font-semibold">
                        {size}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(chartData.measurements).map(([measurement, values]) => (
                    <TableRow key={measurement}>
                      <TableCell className="font-medium">{measurement}</TableCell>
                      {values.map((value, index) => (
                        <TableCell key={index} className="text-center">
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>{text("sizeChart.instructionsTitle")}</strong></p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>{text("sizeChart.instructionsChest")}</li>
                <li>{text("sizeChart.instructionsLength")}</li>
                <li>{text("sizeChart.instructionsShoulder")}</li>
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

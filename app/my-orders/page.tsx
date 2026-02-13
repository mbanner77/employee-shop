"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Package, ChevronDown, ChevronUp, ArrowLeft, Truck, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface OrderItem {
  id: string
  size: string
  product: {
    id: string
    name: string
    image: string
    category: string
  }
}

interface Order {
  id: string
  orderNumber?: string
  status: string
  createdAt: string
  customerName: string
  street: string
  zip: string
  city: string
  trackingNumber?: string
  trackingUrl?: string
  items: OrderItem[]
}

const statusLabels: Record<string, string> = {
  PENDING: "Ausstehend",
  PROCESSING: "In Bearbeitung",
  SHIPPED: "Versendet",
  DELIVERED: "Zugestellt",
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [yearlyCount, setYearlyCount] = useState(0)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/employees/me/orders")
      const data = await response.json()
      
      if (data.orders) {
        setOrders(data.orders)
      }
      if (data.stats) {
        setYearlyCount(data.stats.yearlyItemCount)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zum Shop
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Meine Bestellungen</h1>
          <p className="text-muted-foreground">Übersicht deiner bisherigen Bestellungen</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <div className="text-sm text-muted-foreground">Gesamte Bestellungen</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Package className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{yearlyCount}</div>
                  <div className="text-sm text-muted-foreground">Artikel dieses Jahr</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{Math.max(0, 4 - yearlyCount)}</div>
                  <div className="text-sm text-muted-foreground">Noch verfügbar</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Noch keine Bestellungen</p>
              <p className="text-muted-foreground mb-4">Du hast noch keine Artikel bestellt.</p>
              <Link href="/">
                <Button>Jetzt shoppen</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-base font-mono">
                        #{order.id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                      <Badge variant="outline">
                        {order.items.length} Artikel
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                      {expandedOrder === order.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedOrder === order.id && (
                  <CardContent className="border-t pt-4">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="font-semibold mb-3">Bestellte Artikel</h4>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 bg-muted p-3 rounded-lg">
                              <div className="relative h-12 w-12 rounded overflow-hidden">
                                <Image
                                  src={item.product.image || "/placeholder.svg"}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{item.product.name}</p>
                                <p className="text-sm text-muted-foreground">{item.product.category}</p>
                              </div>
                              <Badge variant="secondary">{item.size}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Lieferadresse</h4>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-muted-foreground">{order.street}</p>
                          <p className="text-muted-foreground">{order.zip} {order.city}</p>
                        </div>

                        {/* Tracking Info */}
                        {order.trackingNumber && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-3">Sendungsverfolgung</h4>
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Truck className="h-5 w-5 text-blue-600" />
                                <div className="flex-1">
                                  <p className="text-sm text-blue-800">Tracking-Nummer</p>
                                  <p className="font-mono font-medium text-blue-900">{order.trackingNumber}</p>
                                </div>
                                {order.trackingUrl && (
                                  <a
                                    href={order.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    Verfolgen
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <h4 className="font-semibold mt-4 mb-3">Bestellfortschritt</h4>
                        <div className="relative">
                          {/* Progress bar background */}
                          <div className="absolute top-3 left-3 right-3 h-1 bg-muted rounded" />
                          {/* Progress bar fill */}
                          <div 
                            className="absolute top-3 left-3 h-1 bg-primary rounded transition-all"
                            style={{ 
                              width: order.status === "PENDING" ? "0%" : 
                                     order.status === "PROCESSING" ? "33%" : 
                                     order.status === "SHIPPED" ? "66%" : "100%",
                              maxWidth: "calc(100% - 24px)"
                            }}
                          />
                          <div className="relative flex justify-between">
                            <div className="flex flex-col items-center">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                true ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}>✓</div>
                              <span className="text-xs mt-2 text-center">Bestellt</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                order.status !== "PENDING" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}>{order.status !== "PENDING" ? "✓" : "2"}</div>
                              <span className="text-xs mt-2 text-center">Bearbeitung</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                order.status === "SHIPPED" || order.status === "DELIVERED" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                              }`}>{order.status === "SHIPPED" || order.status === "DELIVERED" ? "✓" : "3"}</div>
                              <span className="text-xs mt-2 text-center">Versendet</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                order.status === "DELIVERED" ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                              }`}>{order.status === "DELIVERED" ? "✓" : "4"}</div>
                              <span className="text-xs mt-2 text-center">Zugestellt</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

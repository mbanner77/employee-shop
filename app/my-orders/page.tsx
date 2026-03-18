"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAppTexts } from "@/components/app-text-provider"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Package, ChevronDown, ChevronUp, ArrowLeft, Truck, ExternalLink, XCircle, RefreshCw, Clock } from "lucide-react"
import { useShopStore } from "@/lib/store"
import { toast } from "sonner"
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

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export default function MyOrdersPage() {
  const router = useRouter()
  const { addToCart, products, fetchProducts } = useShopStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [yearlyCount, setYearlyCount] = useState(0)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const { text, textf } = useAppTexts()

  // Tick every 10s to update remaining cancel time
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [])

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return text("orders.status.pending")
      case "PROCESSING":
        return text("orders.status.processing")
      case "SHIPPED":
        return text("orders.status.shipped")
      case "DELIVERED":
        return text("orders.status.delivered")
      case "CANCELLED":
        return "Storniert"
      default:
        return status
    }
  }

  const handleReorder = async (order: Order) => {
    if (products.length === 0) await fetchProducts()
    const currentProducts = useShopStore.getState().products
    let addedCount = 0
    for (const item of order.items) {
      const product = currentProducts.find((p) => p.id === item.product.id)
      if (product) {
        const added = addToCart(product, item.size)
        if (added) addedCount++
      }
    }
    if (addedCount > 0) {
      toast.success(`${addedCount} Artikel in den Warenkorb gelegt`)
      router.push("/checkout")
    } else {
      toast.error("Die Artikel dieser Bestellung sind nicht mehr verfügbar")
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Möchtest du diese Bestellung wirklich stornieren?")) return
    setCancellingOrderId(orderId)
    try {
      const res = await fetch(`/api/employees/me/orders/${orderId}/cancel`, { method: "POST" })
      if (res.ok) {
        setOrders(orders.map((o) => o.id === orderId ? { ...o, status: "CANCELLED" } : o))
        toast.success("Bestellung wurde storniert")
      } else {
        const data = await res.json()
        toast.error(data.error || "Stornierung fehlgeschlagen")
      }
    } catch (error) {
      console.error("Failed to cancel order:", error)
      toast.error("Stornierung fehlgeschlagen")
    } finally {
      setCancellingOrderId(null)
    }
  }

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
              {text("orders.back")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{text("orders.title")}</h1>
          <p className="text-muted-foreground">{text("orders.description")}</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <div className="text-sm text-muted-foreground">{text("orders.total")}</div>
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
                  <div className="text-sm text-muted-foreground">{text("orders.thisYear")}</div>
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
                  <div className="text-sm text-muted-foreground">{text("orders.remaining")}</div>
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
              <p className="text-lg font-medium">{text("orders.emptyTitle")}</p>
              <p className="text-muted-foreground mb-4">{text("orders.emptyDescription")}</p>
              <Link href="/">
                <Button>{text("orders.shopNow")}</Button>
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
                        {getStatusLabel(order.status)}
                      </Badge>
                      <Badge variant="outline">
                        {textf("orders.itemCount", { count: order.items.length })}
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
                        <h4 className="font-semibold mb-3">{text("orders.items")}</h4>
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
                        <h4 className="font-semibold mb-3">{text("orders.address")}</h4>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-muted-foreground">{order.street}</p>
                          <p className="text-muted-foreground">{order.zip} {order.city}</p>
                        </div>

                        {/* Tracking Info */}
                        {order.trackingNumber && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-3">{text("orders.tracking")}</h4>
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Truck className="h-5 w-5 text-blue-600" />
                                <div className="flex-1">
                                  <p className="text-sm text-blue-800">{text("orders.trackingNumber")}</p>
                                  <p className="font-mono font-medium text-blue-900">{order.trackingNumber}</p>
                                </div>
                                {order.trackingUrl && (
                                  <a
                                    href={order.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    {text("orders.trackingLink")}
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {order.status === "CANCELLED" ? (
                          <div className="mt-4 space-y-3">
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                              <div className="flex items-center gap-3">
                                <XCircle className="h-5 w-5 text-red-600" />
                                <p className="text-red-800 font-medium">Diese Bestellung wurde storniert</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReorder(order)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Nochmal bestellen
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="mt-4 flex flex-col gap-2">
                              {order.status === "PENDING" && (() => {
                                const minutesLeft = Math.max(0, 30 - (now - new Date(order.createdAt).getTime()) / 1000 / 60)
                                const canCancel = minutesLeft > 0
                                return canCancel ? (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                      disabled={cancellingOrderId === order.id}
                                      onClick={() => handleCancelOrder(order.id)}
                                    >
                                      {cancellingOrderId === order.id ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <XCircle className="h-4 w-4 mr-2" />
                                      )}
                                      Bestellung stornieren
                                    </Button>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      noch {Math.ceil(minutesLeft)} Min.
                                    </span>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">Stornierungsfrist (30 Min.) abgelaufen</p>
                                )
                              })()}
                              {(order.status === "DELIVERED" || order.status === "SHIPPED") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReorder(order)}
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Nochmal bestellen
                                </Button>
                              )}
                            </div>

                            <h4 className="font-semibold mt-4 mb-3">{text("orders.progress")}</h4>
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
                                  <span className="text-xs mt-2 text-center">{text("orders.stepOrdered")}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    order.status !== "PENDING" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                  }`}>{order.status !== "PENDING" ? "✓" : "2"}</div>
                                  <span className="text-xs mt-2 text-center">{text("orders.stepProcessing")}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    order.status === "SHIPPED" || order.status === "DELIVERED" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                  }`}>{order.status === "SHIPPED" || order.status === "DELIVERED" ? "✓" : "3"}</div>
                                  <span className="text-xs mt-2 text-center">{text("orders.stepShipped")}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    order.status === "DELIVERED" ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"
                                  }`}>{order.status === "DELIVERED" ? "✓" : "4"}</div>
                                  <span className="text-xs mt-2 text-center">{text("orders.stepDelivered")}</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
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

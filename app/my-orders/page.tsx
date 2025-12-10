"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Package, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"
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
  status: string
  createdAt: string
  customerName: string
  street: string
  zip: string
  city: string
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
      const meResponse = await fetch("/api/employees/me")
      const meData = await meResponse.json()
      
      if (meData.employee) {
        const response = await fetch(`/api/employees/${meData.employee.id}`)
        const data = await response.json()
        
        if (data.orders) {
          setOrders(data.orders)
          
          // Calculate yearly count
          const currentYear = new Date().getFullYear()
          const thisYearOrders = data.orders.filter((order: Order) => 
            new Date(order.createdAt).getFullYear() === currentYear
          )
          const itemCount = thisYearOrders.reduce((sum: number, order: Order) => 
            sum + order.items.length, 0
          )
          setYearlyCount(itemCount)
        }
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

                        <h4 className="font-semibold mt-4 mb-3">Status-Verlauf</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-sm">Bestellt am {new Date(order.createdAt).toLocaleDateString("de-DE")}</span>
                          </div>
                          {order.status !== "PENDING" && (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500" />
                              <span className="text-sm">In Bearbeitung</span>
                            </div>
                          )}
                          {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-purple-500" />
                              <span className="text-sm">Versendet</span>
                            </div>
                          )}
                          {order.status === "DELIVERED" && (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              <span className="text-sm">Zugestellt</span>
                            </div>
                          )}
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

"use client"

import { useState, useEffect } from "react"
import { type Order } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const statusLabels: Record<Order["status"], string> = {
  PENDING: "Ausstehend",
  PROCESSING: "In Bearbeitung",
  SHIPPED: "Versendet",
  DELIVERED: "Zugestellt",
}

const statusColors: Record<Order["status"], string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        setOrders(orders.map((order) => 
          order.id === orderId ? { ...order, status } : order
        ))
      }
    } catch (error) {
      console.error("Failed to update order:", error)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || order.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bestellungen</h1>
        <p className="text-muted-foreground">Verwalte alle Mitarbeiterbestellungen</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suche nach Name, E-Mail oder Bestellnummer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="PENDING">Ausstehend</SelectItem>
            <SelectItem value="PROCESSING">In Bearbeitung</SelectItem>
            <SelectItem value="SHIPPED">Versendet</SelectItem>
            <SelectItem value="DELIVERED">Zugestellt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sortedOrders.length === 0 ? (
        <Card>
          <CardContent className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">
              {orders.length === 0 ? "Noch keine Bestellungen eingegangen" : "Keine Bestellungen gefunden"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-base font-mono">{order.id}</CardTitle>
                    <Badge className={cn("font-normal", statusColors[order.status])}>
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden text-sm text-muted-foreground sm:block">
                      {new Date(order.createdAt).toLocaleDateString("de-DE")}
                    </span>
                    {expandedOrder === order.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>{order.customerName}</span>
                  <span>{order.email}</span>
                  <span>{order.department}</span>
                </div>
              </CardHeader>

              {expandedOrder === order.id && (
                <CardContent className="border-t pt-4">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <h4 className="mb-3 font-semibold">Bestellte Artikel</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between rounded-lg bg-muted p-3">
                            <span>{item.product.name}</span>
                            <Badge variant="outline">{item.size}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 font-semibold">Lieferadresse</h4>
                      <div className="rounded-lg bg-muted p-3 text-sm">
                        <p className="font-medium">{order.customerName}</p>
                        <p>{order.street}</p>
                        <p>
                          {order.zip} {order.city}
                        </p>
                      </div>

                      <h4 className="mb-3 mt-4 font-semibold">Status ändern</h4>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value as Order["status"])}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Ausstehend</SelectItem>
                          <SelectItem value="PROCESSING">In Bearbeitung</SelectItem>
                          <SelectItem value="SHIPPED">Versendet</SelectItem>
                          <SelectItem value="DELIVERED">Zugestellt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

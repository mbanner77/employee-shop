"use client"

import { useState, useEffect } from "react"
import { useAppTexts } from "@/components/app-text-provider"
import { type Order } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Search, Loader2, User } from "lucide-react"
import { cn } from "@/lib/utils"

type OrderStatus = Order["status"]

interface SupplierOrderItem {
  id: string
  productId: string
  productName: string
  articleNumber?: string | null
  size: string
  color?: string | null
  quantity: number
  status: OrderStatus
}

interface SupplierOrder {
  id: string
  orderNumber?: string | null
  customerName: string
  email: string
  street: string
  city: string
  zip: string
  country: string
  department: string
  status: OrderStatus
  createdAt: string
  employee?: {
    id: string
    firstName: string
    lastName: string
    employeeId: string
  } | null
  items: SupplierOrderItem[]
}

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
}

export function SupplierOrders() {
  const [orders, setOrders] = useState<SupplierOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const { text, textf } = useAppTexts()

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return text("supplier.orders.status.pending")
      case "PROCESSING":
        return text("supplier.orders.status.processing")
      case "SHIPPED":
        return text("supplier.orders.status.shipped")
      case "DELIVERED":
        return text("supplier.orders.status.delivered")
      default:
        return status
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/supplier/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(Array.isArray(data?.orders) ? data.orders : [])
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

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId)
    try {
      const response = await fetch(`/api/supplier/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", status }),
      })
      if (response.ok) {
        const data = await response.json()
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: data.status || status,
                  items: order.items.map((item) => ({ ...item, status })),
                }
              : order,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to update order:", error)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/supplier/logout", { method: "POST" })
    } finally {
      window.location.reload()
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.orderNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{text("supplier.orders.title")}</h1>
          <p className="text-muted-foreground">{text("supplier.orders.description")}</p>
        </div>
        <Button variant="outline" onClick={logout}>{text("supplier.orders.logout")}</Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={text("supplier.orders.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={text("supplier.orders.filterPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{text("supplier.orders.filterAll")}</SelectItem>
            <SelectItem value="PENDING">{text("supplier.orders.status.pending")}</SelectItem>
            <SelectItem value="PROCESSING">{text("supplier.orders.status.processing")}</SelectItem>
            <SelectItem value="SHIPPED">{text("supplier.orders.status.shipped")}</SelectItem>
            <SelectItem value="DELIVERED">{text("supplier.orders.status.delivered")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sortedOrders.length === 0 ? (
        <Card>
          <CardContent className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">
              {orders.length === 0 ? text("supplier.orders.empty") : text("supplier.orders.emptyFiltered")}
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
                    <CardTitle className="text-base font-mono">{order.orderNumber || order.id}</CardTitle>
                    <Badge className={cn("font-normal", statusColors[order.status])}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden text-sm text-muted-foreground sm:block">
                      {new Date(order.createdAt).toLocaleDateString("de-DE")}
                    </span>
                    {expandedOrder === order.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>{order.customerName}</span>
                  <span>{order.email}</span>
                  <span>{order.department}</span>
                  {order.employee && (
                    <span className="flex items-center gap-1 text-primary">
                      <User className="h-3 w-3" />
                      {order.employee.firstName} {order.employee.lastName} ({order.employee.employeeId})
                    </span>
                  )}
                </div>
              </CardHeader>

              {expandedOrder === order.id && (
                <CardContent className="border-t pt-4">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <h4 className="mb-3 font-semibold">{text("supplier.orders.items")}</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between rounded-lg bg-muted p-3">
                            <div>
                              <span>{item.productName}</span>
                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {item.color && <span>{textf("supplier.orders.color", { color: item.color })}</span>}
                                {item.articleNumber && <span>{textf("supplier.orders.articleNumber", { articleNumber: item.articleNumber })}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{item.size}</Badge>
                              <Badge variant="secondary">x{item.quantity}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 font-semibold">{text("supplier.orders.address")}</h4>
                      <div className="rounded-lg bg-muted p-3 text-sm">
                        <p className="font-medium">{order.customerName}</p>
                        <p>{order.street}</p>
                        <p>
                          {order.zip} {order.city}
                        </p>
                      </div>

                      <h4 className="mb-3 mt-4 font-semibold">{text("supplier.orders.changeStatus")}</h4>
                      <div className="relative">
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}
                          disabled={updatingOrderId === order.id}
                        >
                          <SelectTrigger>
                            {updatingOrderId === order.id ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {text("supplier.orders.updating")}
                              </span>
                            ) : (
                              <SelectValue />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">{text("supplier.orders.status.pending")}</SelectItem>
                            <SelectItem value="PROCESSING">{text("supplier.orders.status.processing")}</SelectItem>
                            <SelectItem value="SHIPPED">{text("supplier.orders.status.shipped")}</SelectItem>
                            <SelectItem value="DELIVERED">{text("supplier.orders.status.delivered")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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

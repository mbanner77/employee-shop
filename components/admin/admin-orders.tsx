"use client"

import React, { useState, useEffect } from "react"
import { type Order } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronUp, Search, Loader2, User, Download, CheckSquare } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface OrderWithEmployee extends Order {
  employee?: {
    id: string
    firstName: string
    lastName: string
    employeeId: string
  } | null
}

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
  const [orders, setOrders] = useState<OrderWithEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [bulkUpdating, setBulkUpdating] = useState(false)

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
    setUpdatingOrderId(orderId)
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
    } finally {
      setUpdatingOrderId(null)
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

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
  }

  const toggleAllOrders = () => {
    if (selectedOrders.size === sortedOrders.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(sortedOrders.map(o => o.id)))
    }
  }

  const bulkUpdateStatus = async (status: Order["status"]) => {
    if (selectedOrders.size === 0) return
    setBulkUpdating(true)
    try {
      const promises = Array.from(selectedOrders).map(orderId =>
        fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        })
      )
      await Promise.all(promises)
      setOrders(orders.map(order =>
        selectedOrders.has(order.id) ? { ...order, status } : order
      ))
      toast.success(`${selectedOrders.size} Bestellungen aktualisiert`)
      setSelectedOrders(new Set())
    } catch (error) {
      console.error("Failed to bulk update orders:", error)
      toast.error("Fehler beim Aktualisieren")
    } finally {
      setBulkUpdating(false)
    }
  }

  const exportToCSV = () => {
    const ordersToExport = selectedOrders.size > 0 
      ? sortedOrders.filter(o => selectedOrders.has(o.id))
      : sortedOrders
    
    const headers = ["Bestellnummer", "Datum", "Status", "Name", "E-Mail", "Abteilung", "Straße", "PLZ", "Stadt", "Artikel", "Größen"]
    const rows = ordersToExport.map(order => [
      order.id,
      new Date(order.createdAt).toLocaleDateString("de-DE"),
      statusLabels[order.status],
      order.customerName,
      order.email,
      order.department,
      order.street,
      order.zip,
      order.city,
      order.items.map(i => i.product.name).join("; "),
      order.items.map(i => i.size).join("; "),
    ])
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n")
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `bestellungen_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    toast.success(`${ordersToExport.length} Bestellungen exportiert`)
  }

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
        <Button variant="outline" onClick={exportToCSV} disabled={sortedOrders.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          {selectedOrders.size > 0 ? `Export (${selectedOrders.size})` : "Export CSV"}
        </Button>
      </div>

      {selectedOrders.size > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium">{selectedOrders.size} ausgewählt</span>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus("PROCESSING")} disabled={bulkUpdating}>
                  {bulkUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  In Bearbeitung
                </Button>
                <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus("SHIPPED")} disabled={bulkUpdating}>
                  Versendet
                </Button>
                <Button size="sm" variant="outline" onClick={() => bulkUpdateStatus("DELIVERED")} disabled={bulkUpdating}>
                  Zugestellt
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedOrders(new Set())}>
                  Auswahl aufheben
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          <div className="flex items-center gap-2 px-1">
            <Checkbox
              checked={selectedOrders.size === sortedOrders.length && sortedOrders.length > 0}
              onCheckedChange={toggleAllOrders}
            />
            <span className="text-sm text-muted-foreground">Alle auswählen</span>
          </div>
          {sortedOrders.map((order) => (
            <Card key={order.id} className={cn(selectedOrders.has(order.id) && "ring-2 ring-primary")}>
              <CardHeader className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedOrders.has(order.id)}
                      onCheckedChange={() => toggleOrderSelection(order.id)}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                    <CardTitle 
                      className="text-base font-mono"
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      {order.id}
                    </CardTitle>
                    <Badge className={cn("font-normal", statusColors[order.status])}>
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                  <div 
                    className="flex items-center gap-4"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
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
                        disabled={updatingOrderId === order.id}
                      >
                        <SelectTrigger>
                          {updatingOrderId === order.id ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Wird aktualisiert...
                            </span>
                          ) : (
                            <SelectValue />
                          )}
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

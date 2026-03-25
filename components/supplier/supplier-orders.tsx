"use client"

import { useState, useEffect } from "react"
import { useAppTexts } from "@/components/app-text-provider"
import { type Order } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Search, Loader2, User, Truck, Download, Upload, CheckSquare } from "lucide-react"
import { Label } from "@/components/ui/label"
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
  CANCELLED: "bg-red-100 text-red-800",
}

export function SupplierOrders() {
  const [orders, setOrders] = useState<SupplierOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})
  const [savingTracking, setSavingTracking] = useState<string | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [csvImporting, setCsvImporting] = useState(false)
  const [csvResult, setCsvResult] = useState<{ success: number; failed: number; total: number } | null>(null)
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

  const saveTracking = async (orderId: string) => {
    const trackingNumber = trackingInputs[orderId]?.trim()
    if (!trackingNumber) return
    setSavingTracking(orderId)
    try {
      const response = await fetch(`/api/supplier/orders/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "tracking", trackingNumber }),
      })
      if (response.ok) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === orderId
              ? { ...order, items: order.items.map((item) => ({ ...item, status: "SHIPPED" as OrderStatus })) }
              : order,
          ),
        )
        setTrackingInputs((prev) => ({ ...prev, [orderId]: "" }))
      }
    } catch (error) {
      console.error("Failed to save tracking:", error)
    } finally {
      setSavingTracking(null)
    }
  }

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedOrders.size === sortedOrderIds.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(sortedOrderIds))
    }
  }

  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    if (selectedOrders.size === 0) return
    setBulkUpdating(true)
    try {
      const promises = Array.from(selectedOrders).map(async (orderId) => {
        const res = await fetch(`/api/supplier/orders/${orderId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "status", status: newStatus }),
        })
        if (res.ok) {
          const data = await res.json()
          return { orderId, status: data.status || newStatus, success: true }
        }
        return { orderId, status: newStatus, success: false }
      })
      const results = await Promise.all(promises)
      setOrders((current) =>
        current.map((order) => {
          const result = results.find((r) => r.orderId === order.id && r.success)
          if (result) {
            return { ...order, status: result.status, items: order.items.map((item) => ({ ...item, status: newStatus })) }
          }
          return order
        }),
      )
      setSelectedOrders(new Set())
    } catch (error) {
      console.error("Bulk update failed:", error)
    } finally {
      setBulkUpdating(false)
    }
  }

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    setCsvImporting(true)
    setCsvResult(null)
    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).filter((l) => l.trim())
      if (lines.length < 2) {
        setCsvResult({ success: 0, failed: 0, total: 0 })
        return
      }
      // Skip header row, parse "Bestellnummer;Tracking-Nummer"
      const rows = lines.slice(1).map((line) => {
        const cols = line.split(";").map((c) => c.replace(/^"|"$/g, "").trim())
        return { orderNumber: cols[0], trackingNumber: cols[1] }
      }).filter((r) => r.orderNumber && r.trackingNumber)

      let success = 0
      let failed = 0
      for (const row of rows) {
        // Find order by orderNumber or ID
        const order = orders.find(
          (o) => o.orderNumber === row.orderNumber || o.id === row.orderNumber,
        )
        if (!order) { failed++; continue }
        try {
          const res = await fetch(`/api/supplier/orders/${order.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "tracking", trackingNumber: row.trackingNumber }),
          })
          if (res.ok) {
            setOrders((current) =>
              current.map((o) =>
                o.id === order.id
                  ? { ...o, status: "SHIPPED" as OrderStatus, items: o.items.map((item) => ({ ...item, status: "SHIPPED" as OrderStatus })) }
                  : o,
              ),
            )
            success++
          } else { failed++ }
        } catch { failed++ }
      }
      setCsvResult({ success, failed, total: rows.length })
    } catch (error) {
      console.error("CSV import failed:", error)
      setCsvResult({ success: 0, failed: 1, total: 1 })
    } finally {
      setCsvImporting(false)
    }
  }

  const splitStreetAndNumber = (street: string): [string, string] => {
    const match = street.match(/^(.+?)\s+(\d+\s*\w*)$/)
    if (match) return [match[1].trim(), match[2].trim()]
    return [street, ""]
  }

  const handleCsvDownload = () => {
    const exportOrders = filterStatus === "all" ? orders : orders.filter((o) => {
      const itemStatus = o.items[0]?.status || o.status
      return itemStatus === filterStatus
    })
    const headers = [
      "Bestellnummer", "Datum", "Vorname", "Nachname", "E-Mail", "Abteilung",
      "Straße", "Hausnummer", "PLZ", "Stadt", "Land",
      "Artikel", "Artikelnummer", "Größe", "Farbe", "Menge", "Status",
    ]
    const rows = exportOrders.flatMap((order) => {
      const firstName = order.employee?.firstName || order.customerName.split(" ")[0] || ""
      const lastName = order.employee?.lastName || order.customerName.split(" ").slice(1).join(" ") || ""
      const [streetName, houseNumber] = splitStreetAndNumber(order.street)
      return order.items.map((item) => [
        order.orderNumber || order.id,
        new Date(order.createdAt).toLocaleDateString("de-DE"),
        firstName,
        lastName,
        order.email,
        order.department,
        streetName,
        houseNumber,
        order.zip,
        order.city,
        order.country || "Deutschland",
        item.productName,
        item.articleNumber || "",
        item.size,
        item.color || "",
        String(item.quantity),
        item.status === "DELIVERED" ? "Zugestellt" : item.status === "SHIPPED" ? "Versendet" : item.status === "PROCESSING" ? "In Bearbeitung" : "Ausstehend",
      ])
    })
    const BOM = "\uFEFF"
    const csv = BOM + [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bestellungen-${filterStatus === "all" ? "alle" : filterStatus.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
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
  const sortedOrderIds = sortedOrders.map((o) => o.id)

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
        <Button variant="outline" onClick={handleCsvDownload} disabled={orders.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          CSV-Export
        </Button>
        <div className="relative">
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvImport}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={csvImporting}
          />
          <Button variant="outline" disabled={csvImporting}>
            {csvImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            CSV-Import
          </Button>
        </div>
      </div>

      {csvResult && (
        <div className={cn(
          "rounded-lg border px-4 py-3 text-sm",
          csvResult.failed > 0 ? "border-orange-300 bg-orange-50 text-orange-800" : "border-green-300 bg-green-50 text-green-800",
        )}>
          CSV-Import: {csvResult.success} von {csvResult.total} Bestellungen erfolgreich aktualisiert.
          {csvResult.failed > 0 && ` ${csvResult.failed} fehlgeschlagen.`}
          <button onClick={() => setCsvResult(null)} className="ml-2 underline">Schließen</button>
        </div>
      )}

      {/* Bulk action bar */}
      {selectedOrders.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
          <span className="text-sm font-medium">{selectedOrders.size} Bestellung(en) ausgewählt</span>
          <Select
            onValueChange={(value) => handleBulkStatusChange(value as OrderStatus)}
            disabled={bulkUpdating}
          >
            <SelectTrigger className="w-48">
              {bulkUpdating ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Wird aktualisiert…</span>
              ) : (
                <SelectValue placeholder="Status ändern…" />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">{getStatusLabel("PENDING")}</SelectItem>
              <SelectItem value="PROCESSING">{getStatusLabel("PROCESSING")}</SelectItem>
              <SelectItem value="SHIPPED">{getStatusLabel("SHIPPED")}</SelectItem>
              <SelectItem value="DELIVERED">{getStatusLabel("DELIVERED")}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => setSelectedOrders(new Set())}>Auswahl aufheben</Button>
        </div>
      )}

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
          {/* Select all toggle */}
          <div className="flex items-center gap-2 px-1">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckSquare className={cn("h-4 w-4", selectedOrders.size === sortedOrderIds.length && sortedOrderIds.length > 0 ? "text-primary" : "")} />
              {selectedOrders.size === sortedOrderIds.length && sortedOrderIds.length > 0 ? "Alle abwählen" : "Alle auswählen"}
            </button>
          </div>
          {sortedOrders.map((order) => (
            <Card key={order.id} className={cn(selectedOrders.has(order.id) && "ring-2 ring-primary")}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.has(order.id)}
                      onChange={(e) => { e.stopPropagation(); toggleOrderSelection(order.id) }}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4 rounded border-gray-300 accent-primary"
                    />
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
                          value={order.items[0]?.status || order.status}
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

                      <h4 className="mb-2 mt-4 font-semibold flex items-center gap-1.5">
                        <Truck className="h-4 w-4" />
                        Tracking-Nummer
                      </h4>
                      <div className="flex gap-2">
                        <Input
                          placeholder="z.B. 1Z999AA10123456784"
                          value={trackingInputs[order.id] || ""}
                          onChange={(e) => setTrackingInputs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          onClick={() => saveTracking(order.id)}
                          disabled={!trackingInputs[order.id]?.trim() || savingTracking === order.id}
                        >
                          {savingTracking === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Speichern"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Setzt den Status automatisch auf "Versendet".</p>
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

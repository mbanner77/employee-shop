"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, TrendingUp, Loader2, Clock, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

const COLORS = ["oklch(0.45 0.15 260)", "oklch(0.65 0.18 145)", "oklch(0.55 0.22 27)", "oklch(0.70 0.15 60)"]

interface RecentOrder {
  id: string
  customerName: string
  status: string
  createdAt: string
  department: string
  itemCount: number
}

interface LowStockItem {
  id: string
  name: string
  size: string
  currentStock: number
  minStock: number
}

interface Stats {
  totalOrders: number
  totalProducts: number
  pendingOrders: number
  totalItems: number
  totalEmployees: number
  ordersByDepartment: { department: string; count: number }[]
  ordersByCategory: { category: string; count: number }[]
  ordersBySize: { size: string; count: number }[]
  ordersByStatus: { status: string; count: number }[]
  recentOrders: RecentOrder[]
  lowStockItems?: LowStockItem[]
  lowStockCount?: number
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

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalOrders = stats?.totalOrders || 0
  const totalItems = stats?.totalItems || 0
  const pendingOrders = stats?.pendingOrders || 0
  const totalProducts = stats?.totalProducts || 0
  const totalEmployees = stats?.totalEmployees || 0

  const categoryData = stats?.ordersByCategory.map((item) => ({
    name: item.category,
    value: item.count,
  })) || []

  const departmentData = stats?.ordersByDepartment.map((item) => ({
    name: item.department,
    orders: item.count,
  })) || []

  const sizeData = stats?.ordersBySize.map((item) => ({
    name: item.size,
    count: item.count,
  })) || []

  const completedOrders = stats?.ordersByStatus.find(s => s.status === "DELIVERED")?.count || 0
  const shippedOrders = stats?.ordersByStatus.find(s => s.status === "SHIPPED")?.count || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Übersicht</h1>
        <p className="text-muted-foreground">Statistiken zur Mitarbeiterkollektion 2025</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bestellungen</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedOrders} zugestellt, {shippedOrders} versendet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bestellte Artikel</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ∅ {totalOrders > 0 ? (totalItems / totalOrders).toFixed(1) : 0} pro Bestellung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offene Bestellungen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalOrders > 0 ? ((pendingOrders / totalOrders) * 100).toFixed(0) : 0}% aller Bestellungen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mitarbeiter</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              registrierte Accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produkte</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              in der Kollektion
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bestellungen nach Abteilung</CardTitle>
          </CardHeader>
          <CardContent>
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="oklch(0.45 0.15 260)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Noch keine Bestellungen vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Artikel nach Kategorie</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Noch keine Bestellungen vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Größenverteilung</CardTitle>
          </CardHeader>
          <CardContent>
            {sizeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sizeData} layout="horizontal">
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="oklch(0.65 0.18 145)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                Noch keine Bestellungen vorhanden
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Warning */}
      {stats?.lowStockItems && stats.lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Mindestbestand-Warnung ({stats.lowStockCount} Artikel)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.lowStockItems.map((item, index) => (
                <div key={`${item.id}-${item.size}-${index}`} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100">
                  <div>
                    <p className="font-medium text-red-900">{item.name}</p>
                    <p className="text-sm text-red-700">Größe: {item.size}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{item.currentStock}</p>
                    <p className="text-xs text-red-500">Min: {item.minStock}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Letzte Bestellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.department} • {order.itemCount} Artikel
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-24 items-center justify-center text-muted-foreground">
              Noch keine Bestellungen vorhanden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

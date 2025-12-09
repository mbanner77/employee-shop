"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminOrders } from "@/components/admin/admin-orders"
import { AdminProducts } from "@/components/admin/admin-products"
import { AdminStats } from "@/components/admin/admin-stats"
import { AdminLogin } from "@/components/admin/admin-login"

type AdminView = "stats" | "orders" | "products"

export default function AdminPage() {
  const [activeView, setActiveView] = useState<AdminView>("stats")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if already authenticated (session storage)
    const auth = sessionStorage.getItem("admin-auth")
    if (auth === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (success: boolean) => {
    if (success) {
      sessionStorage.setItem("admin-auth", "true")
      setIsAuthenticated(true)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laden...</div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="flex pt-20">
        <AdminSidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 p-6 lg:p-8">
          {activeView === "stats" && <AdminStats />}
          {activeView === "orders" && <AdminOrders />}
          {activeView === "products" && <AdminProducts />}
        </main>
      </div>
    </div>
  )
}

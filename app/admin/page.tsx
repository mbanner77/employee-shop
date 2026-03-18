"use client"

import { useCallback, useEffect, useState } from "react"
import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminCms } from "@/components/admin/admin-cms"
import { AdminOrders } from "@/components/admin/admin-orders"
import { AdminProducts } from "@/components/admin/admin-products"
import { AdminStats } from "@/components/admin/admin-stats"
import { AdminLogin } from "@/components/admin/admin-login"
import { AdminCRM } from "@/components/admin/admin-crm"
import { AdminReports } from "@/components/admin/admin-reports"
import { AdminUsers } from "@/components/admin/admin-users"
import { AdminSuppliers } from "@/components/admin/admin-suppliers"
import { AdminEmailPreview } from "@/components/admin/admin-email-preview"
import { toast } from "sonner"

type AdminView = "stats" | "orders" | "products" | "employees" | "users" | "suppliers" | "reports" | "settings" | "emails"
type AuthenticatedAdmin = {
  id: string
  username: string
}
type AdminSessionResponse = {
  authenticated?: boolean
  admin?: AuthenticatedAdmin
}

export default function AdminPage() {
  const [activeView, setActiveView] = useState<AdminView>("stats")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState<AuthenticatedAdmin | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const checkAuth = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/me", {
        cache: "no-store",
      })
      const data = (await response.json()) as AdminSessionResponse

      if (!response.ok || !data?.authenticated || !data.admin) {
        setIsAuthenticated(false)
        setCurrentAdmin(null)
        return
      }

      setIsAuthenticated(true)
      setCurrentAdmin(data.admin)
    } catch {
      setIsAuthenticated(false)
      setCurrentAdmin(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void checkAuth()
  }, [checkAuth])

  const handleLogin = async (success: boolean) => {
    if (!success) {
      return
    }

    await checkAuth()
  }

  const handleLogout = async () => {
    setLoggingOut(true)

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      })

      if (!response.ok) {
        toast.error("Abmeldung fehlgeschlagen")
        return
      }

      setCurrentAdmin(null)
      setIsAuthenticated(false)
      setActiveView("stats")
      toast.success("Erfolgreich abgemeldet")
    } catch {
      toast.error("Verbindungsfehler bei der Abmeldung")
    } finally {
      setLoggingOut(false)
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
        <AdminSidebar
          activeView={activeView}
          onViewChange={(v) => setActiveView(v as AdminView)}
          adminUsername={currentAdmin?.username ?? null}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />
        <main className="flex-1 p-6 lg:p-8">
          {activeView === "stats" && <AdminStats />}
          {activeView === "orders" && <AdminOrders />}
          {activeView === "products" && <AdminProducts />}
          {activeView === "employees" && <AdminCRM />}
          {activeView === "users" && <AdminUsers />}
          {activeView === "suppliers" && <AdminSuppliers />}
          {activeView === "reports" && <AdminReports />}
          {activeView === "settings" && <AdminCms />}
          {activeView === "emails" && <AdminEmailPreview />}
        </main>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminOrders } from "@/components/admin/admin-orders"
import { AdminProducts } from "@/components/admin/admin-products"
import { AdminStats } from "@/components/admin/admin-stats"

type AdminView = "stats" | "orders" | "products"

export default function AdminPage() {
  const [activeView, setActiveView] = useState<AdminView>("stats")

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="flex">
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

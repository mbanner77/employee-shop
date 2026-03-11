"use client"

import { BarChart3, Package, ShoppingCart, Users, Settings, FileBarChart, UserCog, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  activeView: string
  onViewChange: (view: "stats" | "orders" | "products" | "employees" | "users" | "suppliers" | "reports" | "settings") => void
}

const menuItems = [
  { id: "stats", label: "Übersicht", icon: BarChart3 },
  { id: "orders", label: "Bestellungen", icon: ShoppingCart },
  { id: "products", label: "Produkte", icon: Package },
  { id: "employees", label: "CRM", icon: Users },
  { id: "suppliers", label: "Lieferanten", icon: Truck },
  { id: "users", label: "Administratoren", icon: UserCog },
  { id: "reports", label: "Auswertungen", icon: FileBarChart },
  { id: "settings", label: "CMS", icon: Settings },
] as const

export function AdminSidebar({ activeView, onViewChange }: AdminSidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="sticky top-16 p-4">
        <h2 className="mb-4 px-2 text-lg font-semibold text-foreground">Admin Dashboard</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3",
                activeView === item.id &&
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
              )}
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  )
}

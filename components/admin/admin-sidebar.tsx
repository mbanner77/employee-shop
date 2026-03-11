"use client"

import { BarChart3, FileBarChart, Loader2, LogOut, Package, Settings, ShieldCheck, ShoppingCart, Truck, UserCog, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AdminView = "stats" | "orders" | "products" | "employees" | "users" | "suppliers" | "reports" | "settings"

interface AdminSidebarProps {
  activeView: AdminView
  onViewChange: (view: AdminView) => void
  adminUsername: string | null
  onLogout: () => Promise<void>
  loggingOut: boolean
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

export function AdminSidebar({ activeView, onViewChange, adminUsername, onLogout, loggingOut }: AdminSidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="sticky top-16 flex min-h-[calc(100vh-5rem)] flex-col p-4">
        <div className="space-y-4">
          <h2 className="px-2 text-lg font-semibold text-foreground">Admin Dashboard</h2>
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

        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <div className="rounded-lg border bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4" />
              Angemeldet
            </div>
            <div className="mt-1 truncate text-sm text-muted-foreground">{adminUsername || "Admin"}</div>
          </div>
          <Button variant="outline" className="w-full justify-start gap-3" onClick={() => void onLogout()} disabled={loggingOut}>
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {loggingOut ? "Abmeldung..." : "Abmelden"}
          </Button>
        </div>
      </div>
    </aside>
  )
}

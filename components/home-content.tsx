"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProductGrid } from "@/components/product-grid"
import { EmployeeLogin } from "@/components/employee-login"
import { Package, Truck, Award, LogOut, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Employee {
  id: string
  employeeId: string
  email: string
  firstName: string
  lastName: string
  department: string
}

export function HomeContent() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/employees/me")
      const data = await response.json()
      if (data.employee) {
        setEmployee(data.employee)
      }
    } catch (error) {
      console.error("Session check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (emp: Employee) => {
    setEmployee(emp)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/employees/logout", { method: "POST" })
      setEmployee(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laden...</div>
      </div>
    )
  }

  if (!employee) {
    return <EmployeeLogin onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />

        {/* Employee welcome banner */}
        <div className="bg-primary text-primary-foreground py-3">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <span className="text-sm">
              Willkommen, <strong>{employee.firstName} {employee.lastName}</strong> ({employee.department})
            </span>
            <div className="flex items-center gap-2">
              <Link href="/my-orders">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Meine Bestellungen
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>

        <section className="border-y border-border bg-muted/30 py-12">
          <div className="container mx-auto grid gap-8 px-4 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Package className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">4 Teile Gratis</h3>
              <p className="text-sm text-muted-foreground">Jedes Jahr 4 Artikel kostenfrei für dich</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Truck className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Direkte Lieferung</h3>
              <p className="text-sm text-muted-foreground">Versand an deine Wunschadresse</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">Premium Qualität</h3>
              <p className="text-sm text-muted-foreground">Hochwertige Materialien & Verarbeitung</p>
            </div>
          </div>
        </section>

        <ProductGrid />
      </main>

      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">© 2025 RealCore GmbH. Alle Rechte vorbehalten.</p>
            <p className="text-xs text-muted-foreground/60">Bei Fragen wende dich an deine HR-Abteilung.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

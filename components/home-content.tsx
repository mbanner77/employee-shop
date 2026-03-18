"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAppTexts } from "@/components/app-text-provider"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ProductGrid } from "@/components/product-grid"
import { EmployeeLogin } from "@/components/employee-login"
import { Package, Truck, Award, LogOut, ClipboardList, Star } from "lucide-react"
import { Footer } from "@/components/footer"
import { TopRatedProducts } from "@/components/top-rated-products"
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
  const { text, textf } = useAppTexts()

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
        <div className="animate-pulse text-muted-foreground">{text("home.loading")}</div>
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
              {textf("home.welcome", {
                firstName: employee.firstName,
                lastName: employee.lastName,
                department: employee.department,
              })}
            </span>
            <div className="flex items-center gap-2">
              <Link href="/my-orders">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  {text("home.ordersLink")}
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {text("home.logout")}
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
              <h3 className="font-semibold text-foreground">{text("home.feature.free.title")}</h3>
              <p className="text-sm text-muted-foreground">{text("home.feature.free.description")}</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Truck className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">{text("home.feature.shipping.title")}</h3>
              <p className="text-sm text-muted-foreground">{text("home.feature.shipping.description")}</p>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground">{text("home.feature.quality.title")}</h3>
              <p className="text-sm text-muted-foreground">{text("home.feature.quality.description")}</p>
            </div>
          </div>
        </section>

        <TopRatedProducts />

        <ProductGrid />
      </main>

      <Footer />
    </div>
  )
}

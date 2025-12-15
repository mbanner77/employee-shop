"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { SupplierLogin } from "@/components/supplier/supplier-login"
import { SupplierOrders } from "@/components/supplier/supplier-orders"

export default function SupplierPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const auth = sessionStorage.getItem("supplier-auth")
    if (auth === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (success: boolean) => {
    if (success) {
      sessionStorage.setItem("supplier-auth", "true")
      setIsAuthenticated(true)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Laden...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <SupplierLogin onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <div className="pt-20 p-6 lg:p-8">
        <SupplierOrders />
      </div>
    </div>
  )
}

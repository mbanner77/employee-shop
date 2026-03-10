"use client"

import { useEffect, useState } from "react"
import { useAppTexts } from "@/components/app-text-provider"
import { Header } from "@/components/header"
import { SupplierLogin } from "@/components/supplier/supplier-login"
import { SupplierOrders } from "@/components/supplier/supplier-orders"

export default function SupplierPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { text } = useAppTexts()

  useEffect(() => {
    fetch("/api/supplier/me")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unauthorized")
        }
        return res.json()
      })
      .then((data) => setIsAuthenticated(Boolean(data?.authenticated)))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsLoading(false))
  }, [])

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{text("supplier.loading")}</div>
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
